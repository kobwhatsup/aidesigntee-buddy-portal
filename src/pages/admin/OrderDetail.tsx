import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, User, Calendar, DollarSign } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      return orderData;
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    gcTime: 1000 * 60 * 30, // 30分钟后清除缓存
  });

  // 格式化订单状态
  const formatOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_payment: '待付款',
      paid: '已付款',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已送达',
      refund_requested: '申请退款',
      refunded: '已退款',
      payment_timeout: '支付超时'
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return <div className="p-6">加载中...</div>;
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
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              订单信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">订单编号</dt>
                <dd>{order.order_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">订单状态</dt>
                <dd>
                  <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {formatOrderStatus(order.status)}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">创建时间</dt>
                <dd>{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">订单金额</dt>
                <dd className="font-semibold">¥{order.total_amount}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              收货信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">收货人</dt>
                <dd>{order.recipient_name || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">联系电话</dt>
                <dd>{order.recipient_phone || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">收货地址</dt>
                <dd>{order.shipping_address || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {order.shipped_at && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                物流信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">物流公司</dt>
                  <dd>{order.shipping_company || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">物流单号</dt>
                  <dd>{order.tracking_number || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">发货时间</dt>
                  <dd>{order.shipped_at ? format(new Date(order.shipped_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>订单商品</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品信息</TableHead>
                <TableHead>规格</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>小计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {item.preview_front && (
                        <img 
                          src={item.preview_front} 
                          alt="商品预览图" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <div>T恤定制</div>
                        <div className="text-sm text-gray-500">款式：{item.tshirt_style}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>颜色：{item.tshirt_color}</div>
                      <div>尺码：{item.tshirt_size}</div>
                      <div>性别：{item.tshirt_gender}</div>
                    </div>
                  </TableCell>
                  <TableCell>¥{item.unit_price}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>¥{item.unit_price * item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}