
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface AdminUser extends User {
  created_at: string;
  email: string;
  last_sign_in_at?: string;
  banned_until?: string;
  user_metadata: {
    name?: string;
    [key: string]: any;
  };
}

export default function Users() {
  const { toast } = useToast();

  const { data: users, isLoading: isLoadingUsers, error } = useQuery({
    queryKey: ['auth-users'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('未登录');
      }

      // 获取用户列表
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '获取用户列表失败');
        }

        const { users } = await response.json();
        return users as AdminUser[];
      } catch (error: any) {
        console.error('获取用户列表错误:', error);
        throw new Error(error.message || '获取用户列表失败');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (userId: string) => {
    // TODO: 实现查看用户详情功能
    console.log('查看用户详情:', userId);
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
              <TableHead>邮箱</TableHead>
              <TableHead>显示名称</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-red-600">
                  加载失败: {error.message}
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  暂无用户数据
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.user_metadata.name || '未设置'}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at ? 
                      format(new Date(user.last_sign_in_at), 'yyyy-MM-dd HH:mm:ss') : 
                      '从未登录'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.banned_until ? 
                      'bg-red-100 text-red-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.banned_until ? '已禁用' : '正常'}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
