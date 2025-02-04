import { Card } from "@/components/ui/card";
import { ChartBar, Users, ShoppingCart, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  // 获取用户统计数据
  const { data: usersStats } = useQuery({
    queryKey: ['users-stats'],
    queryFn: async () => {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return { totalUsers, newUsers };
    }
  });

  // 获取订单统计数据
  const { data: ordersStats } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: async () => {
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { data: totalAmount } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalSales = totalAmount?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      return { totalOrders, totalSales };
    }
  });

  // 获取待审核设计数量
  const { data: designStats } = useQuery({
    queryKey: ['designs-stats'],
    queryFn: async () => {
      const { count: pendingDesigns } = await supabase
        .from('design_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', false);

      return { pendingDesigns };
    }
  });

  const stats = [
    {
      name: "总用户数",
      value: usersStats?.totalUsers?.toString() || "加载中...",
      icon: Users,
      change: usersStats?.newUsers ? `+${usersStats.newUsers}` : "...",
      changeType: "increase",
    },
    {
      name: "总订单数",
      value: ordersStats?.totalOrders?.toString() || "加载中...",
      icon: ShoppingCart,
      change: ordersStats?.totalSales ? `¥${ordersStats.totalSales.toFixed(2)}` : "...",
      changeType: "increase",
    },
    {
      name: "待审核设计",
      value: designStats?.pendingDesigns?.toString() || "加载中...",
      icon: CheckCircle,
      change: "待处理",
      changeType: "neutral",
    },
    {
      name: "本月销售额",
      value: ordersStats?.totalSales ? `¥${ordersStats.totalSales.toFixed(2)}` : "加载中...",
      icon: ChartBar,
      change: "+23%",
      changeType: "increase",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据概览</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : stat.changeType === "decrease"
                      ? "text-red-600"
                      : "text-gray-600"
                  )}
                >
                  {stat.change}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}