
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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
  email: string | null;
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

  const { data: users, isLoading: isLoadingUsers, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithOrders[]> => {
      console.log('开始通过Edge Function获取用户数据...');
      
      try {
        // 调用 Edge Function 获取用户数据
        const { data, error } = await supabase.functions.invoke('get-admin-users');

        if (error) {
          console.error('Edge Function调用失败:', error);
          throw new Error(error.message || '获取用户数据失败');
        }

        if (!data || !data.users) {
          console.error('Edge Function返回数据格式错误:', data);
          throw new Error('服务器返回数据格式错误');
        }

        console.log('成功获取用户数据:', data.users.length, '个用户');
        return data.users;

      } catch (error) {
        console.error('获取用户数据失败:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('获取用户数据失败');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const handleViewDetails = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // 获取用户基本信息
      const userFromList = users?.find(u => u.id === userId);
      if (!userFromList) throw new Error('用户不存在');

      // 获取用户订单信息
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setSelectedUser({
        ...userFromList,
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

  if (error) {
    console.error('查询错误:', error);
    return (
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">用户管理</h1>
        <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
          <p>获取用户数据失败: {error.message}</p>
          <p className="text-sm mt-2">请检查您是否具有管理员权限或网络连接是否正常</p>
        </div>
      </div>
    );
  }

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">正在加载用户数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">用户管理</h1>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-900 font-semibold">邮箱地址</TableHead>
              <TableHead className="text-gray-900 font-semibold">用户名</TableHead>
              <TableHead className="text-gray-900 font-semibold">注册时间</TableHead>
              <TableHead className="text-gray-900 font-semibold">订单数</TableHead>
              <TableHead className="text-gray-900 font-semibold">状态</TableHead>
              <TableHead className="text-gray-900 font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user: UserWithOrders) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {user.email || '未设置'}
                  </TableCell>
                  <TableCell className="text-gray-900">{user.username || '未设置'}</TableCell>
                  <TableCell className="text-gray-900">
                    {format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">{user.order_count}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                      正常
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="text-blue-600 hover:text-blue-800 p-0"
                      onClick={() => handleViewDetails(user.id)}
                    >
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  暂无用户数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">用户详情</DialogTitle>
            <DialogDescription className="text-gray-600">
              查看用户的基本信息和订单历史
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">邮箱地址</h4>
                  <p className="mt-1 text-gray-900">{selectedUser.email || '未设置'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">用户名</h4>
                  <p className="mt-1 text-gray-900">{selectedUser.username || '未设置'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">注册时间</h4>
                  <p className="mt-1 text-gray-900">{format(new Date(selectedUser.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">订单总数</h4>
                  <p className="mt-1 text-gray-900 font-medium">{selectedUser.order_count}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900">最近订单</h3>
                <div className="space-y-4">
                  {selectedUser.orders.length > 0 ? (
                    selectedUser.orders.map(order => (
                      <div key={order.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600">订单编号：{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              下单时间：{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">¥{order.total_amount}</p>
                            <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">暂无订单记录</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedUser(null)}
              className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
