import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const orderStatusMap = {
  pending_payment: "待付款",
  paid: "已付款",
  processing: "处理中",
  shipped: "已发货",
  delivered: "已送达",
  refund_requested: "申请退款",
  refunded: "已退款",
  payment_timeout: "支付超时",
};

type OrderStatus = keyof typeof orderStatusMap;

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
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

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    gcTime: 1000 * 60 * 30, // 30分钟后清除缓存
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "订单状态已更新",
        description: "订单状态更新成功",
      });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (error) => {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: OrderStatus) => {
    if (!order) return;
    updateOrderStatus.mutate({ orderId: order.id, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div>订单不存在</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <div className="flex items-center gap-4">
          <Select
            value={order.status}
            onValueChange={(value: OrderStatus) => handleStatusChange(value)}
            disabled={updateOrderStatus.isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择订单状态" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(orderStatusMap).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">订单编号：</span>
              {order.order_number}
            </div>
            <div>
              <span className="font-medium">创建时间：</span>
              {format(new Date(order.created_at), "yyyy-MM-dd HH:mm:ss")}
            </div>
            <div>
              <span className="font-medium">订单状态：</span>
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {orderStatusMap[order.status as OrderStatus]}
              </span>
            </div>
            <div>
              <span className="font-medium">订单金额：</span>
              ¥{order.total_amount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>收货信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">收货人：</span>
              {order.recipient_name}
            </div>
            <div>
              <span className="font-medium">联系电话：</span>
              {order.recipient_phone}
            </div>
            <div>
              <span className="font-medium">收货地址：</span>
              {order.shipping_address}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  {item.preview_front && (
                    <img
                      src={item.preview_front}
                      alt="商品预览图"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <div>款式：{item.tshirt_style}</div>
                    <div>颜色：{item.tshirt_color}</div>
                    <div>尺码：{item.tshirt_size}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div>数量：{item.quantity}</div>
                  <div>单价：¥{item.unit_price}</div>
                  <div className="font-medium">
                    小计：¥{item.quantity * item.unit_price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}