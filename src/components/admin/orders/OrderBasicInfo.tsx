import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    order_number: string;
    created_at: string;
    status: OrderStatus;
    total_amount: number;
  };
}

export function OrderBasicInfo({ order }: OrderBasicInfoProps) {
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
      </CardContent>
    </Card>
  );
}