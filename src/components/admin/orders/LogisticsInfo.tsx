
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogisticsInfoProps {
  order: {
    shipped_at?: string | null;
    shipping_company?: string | null;
    tracking_number?: string | null;
    delivered_at?: string | null;
    status: string;
  };
}

export function LogisticsInfo({ order }: LogisticsInfoProps) {
  if (!order.shipping_company && !order.tracking_number) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>物流信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.shipped_at && (
          <div>
            <span className="font-medium">发货时间：</span>
            {format(new Date(order.shipped_at), "yyyy-MM-dd HH:mm:ss")}
          </div>
        )}
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
        {order.delivered_at && (
          <div>
            <span className="font-medium">送达时间：</span>
            {format(new Date(order.delivered_at), "yyyy-MM-dd HH:mm:ss")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
