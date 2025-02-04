import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      // 移除 is_deleted 条件，因为这可能会过滤掉一些订单
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            tshirt_size,
            tshirt_color,
            tshirt_style,
            tshirt_gender,
            preview_front,
            preview_back
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data); // 添加日志以便调试
      return data;
    },
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

  const filteredOrders = orders?.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索订单号或收件人"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            筛选
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单编号</TableHead>
              <TableHead>收件人</TableHead>
              <TableHead>订单金额</TableHead>
              <TableHead>订单状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredOrders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  暂无订单数据
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{order.recipient_name || '-'}</TableCell>
                  <TableCell>¥{order.total_amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending_payment' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formatOrderStatus(order.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}