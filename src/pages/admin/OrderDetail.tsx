import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                order.status === 'pending_payment' ? 'bg-blue-100 text-blue-800' :
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
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