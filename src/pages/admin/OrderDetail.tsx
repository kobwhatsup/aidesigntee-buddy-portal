import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OrderBasicInfo } from "@/components/admin/orders/OrderBasicInfo";
import { ShippingInfo } from "@/components/admin/orders/ShippingInfo";
import { OrderItem } from "@/components/admin/orders/OrderItem";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: adminCheck } = useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');
      
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (adminError || !adminUser) {
        throw new Error('没有管理员权限');
      }

      return adminUser;
    },
  });

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) throw new Error("订单ID不能为空");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "获取订单失败",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
    enabled: !!id && !!adminCheck,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-6">订单不存在</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">订单详情</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderBasicInfo order={order} />
        <ShippingInfo order={order} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {order.order_items.map((item: any) => (
              <OrderItem key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}