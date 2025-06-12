
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Bell, DollarSign, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface RealtimeOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  recipient_name?: string;
  created_at: string;
  updated_at: string;
}

export function RealtimeOrderMonitor() {
  const [recentOrders, setRecentOrders] = useState<RealtimeOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 获取最近的订单
    const fetchRecentOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('获取订单失败:', error);
        return;
      }

      setRecentOrders(data || []);
    };

    fetchRecentOrders();

    // 设置实时监听
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('订单实时更新:', payload);
          
          const order = payload.new as RealtimeOrder;
          
          if (payload.eventType === 'INSERT') {
            setRecentOrders(prev => [order, ...prev.slice(0, 9)]);
          } else if (payload.eventType === 'UPDATE') {
            setRecentOrders(prev => 
              prev.map(o => o.id === order.id ? order : o)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('实时连接状态:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_payment: '待付款',
      paid: '已付款',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已送达'
    };
    return statusMap[status] || status;
  };

  return (
    <Card className="h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <CardTitle>实时订单监控</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? '已连接' : '未连接'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[480px]">
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                暂无订单数据
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{order.order_number}</span>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(order.status)}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ¥{order.total_amount}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      {order.recipient_name && (
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {order.recipient_name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(order.created_at), 'MM-dd HH:mm')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/orders')}
            className="w-full"
          >
            查看所有订单
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
