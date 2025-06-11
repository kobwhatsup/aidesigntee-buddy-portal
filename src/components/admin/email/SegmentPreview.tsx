
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentEngine } from "@/utils/segmentEngine";
import { format } from "date-fns";
import { Users, Mail, Calendar, ShoppingBag } from "lucide-react";

interface SegmentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  segment: any;
}

export function SegmentPreview({ isOpen, onClose, segment }: SegmentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: users, isLoading } = useQuery({
    queryKey: ['segment-users', segment?.id, currentPage],
    queryFn: async () => {
      if (!segment) return { users: [], total: 0 };

      const query = SegmentEngine.buildQuery(segment.conditions);
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          real_name,
          created_at,
          phone
        `, { count: 'exact' })
        .or(query)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { users: data || [], total: count || 0 };
    },
    enabled: isOpen && !!segment,
  });

  const { data: userStats } = useQuery({
    queryKey: ['segment-user-stats', segment?.id],
    queryFn: async () => {
      if (!segment || !users?.users.length) return {};

      const userIds = users.users.map(u => u.id);
      
      // 获取用户订单统计
      const { data: orderStats } = await supabase
        .from('orders')
        .select('user_id, total_amount')
        .in('user_id', userIds);

      // 获取用户设计统计
      const { data: designStats } = await supabase
        .from('design_drafts')
        .select('user_id, id')
        .in('user_id', userIds);

      const stats: any = {};
      
      userIds.forEach(userId => {
        const userOrders = orderStats?.filter(o => o.user_id === userId) || [];
        const userDesigns = designStats?.filter(d => d.user_id === userId) || [];
        
        stats[userId] = {
          orderCount: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
          designCount: userDesigns.length,
        };
      });

      return stats;
    },
    enabled: isOpen && !!segment && !!users?.users.length,
  });

  const totalPages = Math.ceil((users?.total || 0) / pageSize);

  if (!segment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {segment.name} - 用户预览
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">总用户数</p>
                    <p className="text-2xl font-bold">{users?.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">有订单用户</p>
                    <p className="text-2xl font-bold">
                      {userStats ? Object.values(userStats).filter((s: any) => s.orderCount > 0).length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">设计师用户</p>
                    <p className="text-2xl font-bold">
                      {userStats ? Object.values(userStats).filter((s: any) => s.designCount > 0).length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge variant={segment.is_dynamic ? "default" : "secondary"}>
                    {segment.is_dynamic ? "动态分群" : "静态分群"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-8">加载中...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {users?.users.map((user) => {
                      const stats = userStats?.[user.id] || { orderCount: 0, totalSpent: 0, designCount: 0 };
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{user.real_name || user.username || '未命名用户'}</p>
                              <p className="text-sm text-gray-500">{user.phone || '无手机号'}</p>
                              <p className="text-xs text-gray-400">
                                注册于 {format(new Date(user.created_at), 'yyyy-MM-dd')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-gray-500">订单数</p>
                              <p className="font-medium">{stats.orderCount}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500">消费金额</p>
                              <p className="font-medium">¥{stats.totalSpent}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500">设计数</p>
                              <p className="font-medium">{stats.designCount}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        第 {currentPage} 页，共 {totalPages} 页
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                        >
                          上一页
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                        >
                          下一页
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>关闭</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
