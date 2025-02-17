
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShippingForm } from "./ShippingForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = keyof typeof orderStatusMap;

const orderStatusMap = {
  pending_payment: "待付款",
  paid: "已付款",
  processing: "处理中",
  shipped: "已发货",
  delivered: "已送达",
  refund_requested: "申请退款",
  refunded: "已退款",
  payment_timeout: "支付超时",
} as const;

interface OrderBasicInfoProps {
  order: {
    id: string;
    order_number: string;
    created_at: string;
    status: OrderStatus;
    total_amount: number;
    shipping_company?: string;
    tracking_number?: string;
  };
  onOrderUpdated?: () => void;
}

export function OrderBasicInfo({ order, onOrderUpdated }: OrderBasicInfoProps) {
  const [isShippingFormOpen, setIsShippingFormOpen] = useState(false);
  const { toast } = useToast();

  const handleConfirmDelivery = async () => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;

      toast({
        title: "确认收货成功",
        description: "订单状态已更新为已送达",
      });
      onOrderUpdated?.();
    } catch (error: any) {
      toast({
        title: "确认收货失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
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
            {orderStatusMap[order.status]}
          </span>
        </div>
        <div>
          <span className="font-medium">订单金额：</span>
          ¥{order.total_amount}
        </div>
        {order.shipping_company && (
          <div>
            <span className="font-medium">物流公司：</span>
            {order.shipping_company}
          </div>
        )}
        {order.tracking_number && (
          <div>
            <span className="font-medium">运单号：</span>
            {order.tracking_number}
          </div>
        )}
        <div className="flex gap-2 mt-4">
          {order.status === 'paid' && (
            <Button onClick={() => setIsShippingFormOpen(true)}>
              发货
            </Button>
          )}
          {order.status === 'shipped' && (
            <Button onClick={handleConfirmDelivery}>
              确认收货
            </Button>
          )}
        </div>
      </CardContent>
      <ShippingForm
        orderId={order.id}
        isOpen={isShippingFormOpen}
        onClose={() => setIsShippingFormOpen(false)}
        onSuccess={onOrderUpdated}
      />
    </Card>
  );
}
