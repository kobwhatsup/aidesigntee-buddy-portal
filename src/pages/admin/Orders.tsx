
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// 定义订单状态类型
type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'refund_requested' | 'refunded' | 'payment_timeout' | 'all';

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  // 首先检查当前用户是否为管理员
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

  // 获取订单列表
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', currentStatus],
    queryFn: async () => {
      let query = supabase
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
            preview_back,
            design_front,
            design_back
          )
        `)
        .order('created_at', { ascending: false });

      // 根据当前选中的状态筛选订单
      if (currentStatus !== 'all') {
        query = query.eq('status', currentStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "获取订单失败",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!adminCheck,
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

  const orderStatusTabs = [
    { id: 'all' as const, label: '全部' },
    { id: 'pending_payment' as const, label: '待付款' },
    { id: 'paid' as const, label: '待发货' },
    { id: 'shipped' as const, label: '待收货' },
    { id: 'refund_requested' as const, label: '退款/售后' },
  ];

  if (!adminCheck) {
    return (
      <div className="p-6 text-center bg-white min-h-screen">
        <h2 className="text-xl font-semibold text-red-600">无权访问</h2>
        <p className="mt-2 text-gray-900">您需要管理员权限才能访问此页面</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="搜索订单号或收件人"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white border-gray-300 text-gray-900"
            />
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            筛选
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          {orderStatusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentStatus(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                currentStatus === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-900 font-semibold">订单编号</TableHead>
              <TableHead className="text-gray-900 font-semibold">收件人</TableHead>
              <TableHead className="text-gray-900 font-semibold">订单金额</TableHead>
              <TableHead className="text-gray-900 font-semibold">订单状态</TableHead>
              <TableHead className="text-gray-900 font-semibold">创建时间</TableHead>
              <TableHead className="text-gray-900 font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-900">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredOrders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-900">
                  暂无订单数据
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders?.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="text-gray-900 font-medium">{order.order_number}</TableCell>
                  <TableCell className="text-gray-900">{order.recipient_name || '-'}</TableCell>
                  <TableCell className="text-gray-900 font-medium">¥{order.total_amount}</TableCell>
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
                  <TableCell className="text-gray-900">
                    {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="text-blue-600 hover:text-blue-800 p-0"
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
