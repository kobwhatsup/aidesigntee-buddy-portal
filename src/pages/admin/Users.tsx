
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface User {
  id: string;
  created_at: string;
  username: string | null;
}

interface UserWithOrders extends User {
  order_count: number;
}

interface UserDetails extends UserWithOrders {
  orders: Array<{
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
  }>;
}

export default function Users() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      // 检查管理员权限
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (adminError || !adminUser) {
        throw new Error('没有管理员权限');
      }

      // 获取用户列表
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          username
        `);

      if (error) throw error;

      // 获取每个用户的订单数量
      const usersWithOrders = await Promise.all(
        profiles.map(async (profile) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          return {
            ...profile,
            order_count: count || 0
          };
        })
      );

      return usersWithOrders;
    }
  });

  const handleViewDetails = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // 获取用户基本信息
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // 获取用户订单信息
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 获取订单数量
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setSelectedUser({
        ...userProfile,
        order_count: count || 0,
        orders: orders || []
      });
    } catch (error: any) {
      toast.error('获取用户详情失败', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">用户管理</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>订单数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: UserWithOrders) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id.slice(0, 8)}</TableCell>
                <TableCell>{user.username || '未设置'}</TableCell>
                <TableCell>{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell>{user.order_count}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    正常
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleViewDetails(user.id)}
                  >
                    查看详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>
              查看用户的基本信息和订单历史
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">用户ID</h4>
                  <p className="mt-1">{selectedUser.id.slice(0, 8)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">用户名</h4>
                  <p className="mt-1">{selectedUser.username || '未设置'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">注册时间</h4>
                  <p className="mt-1">{format(new Date(selectedUser.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">订单总数</h4>
                  <p className="mt-1">{selectedUser.order_count}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">最近订单</h3>
                <div className="space-y-4">
                  {selectedUser.orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">订单编号：{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            下单时间：{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">¥{order.total_amount}</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
