
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy } from "lucide-react";
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
  email: string;
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
    queryFn: async (): Promise<UserWithOrders[]> => {
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

      // 获取用户列表，包括邮箱信息
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          username
        `);

      if (error) throw error;

      // 获取用户邮箱信息
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // 合并用户信息和邮箱
      const usersWithEmail = profiles.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || '未设置'
        };
      });

      // 获取每个用户的订单数量
      const usersWithOrders = await Promise.all(
        usersWithEmail.map(async (profile) => {
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

      // 获取用户邮箱信息
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (authError) throw authError;

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
        email: authUser.user?.email || '未设置',
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            {users?.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]" title={user.email}>
                      {user.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => copyToClipboard(user.email || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-gray-900">{user.username || '未设置'}</TableCell>
                <TableCell className="text-gray-900">{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
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
            ))}
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
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-900">{selectedUser.email}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => copyToClipboard(selectedUser.email || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
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
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-600">用户ID（技术支持用）</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-500 text-sm font-mono">{selectedUser.id}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => copyToClipboard(selectedUser.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900">最近订单</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto">
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
                    <div className="text-center py-8 text-gray-500">
                      该用户暂无订单记录
                    </div>
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
