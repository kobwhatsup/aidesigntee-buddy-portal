import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShippingInfoProps {
  order: {
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
  };
}

export function ShippingInfo({ order }: ShippingInfoProps) {
  return (
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
  );
}