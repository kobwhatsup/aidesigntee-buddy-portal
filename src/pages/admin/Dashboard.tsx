import { Card } from "@/components/ui/card";
import { ChartBar, Users, ShoppingCart, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChartContainer, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip
} from "recharts";

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
        .eq('status', 'delivered');

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

  // 获取每日销售数据
  const { data: dailySales } = useQuery({
    queryKey: ['daily-sales'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .eq('status', 'delivered')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      const salesByDay = data?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + (order.total_amount || 0);
        return acc;
      }, {});

      return Object.entries(salesByDay || {}).map(([date, amount]) => ({
        date,
        amount
      }));
    }
  });

  // 获取每日新增用户数据
  const { data: dailyUsers } = useQuery({
    queryKey: ['daily-users'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      const usersByDay = data?.reduce((acc: any, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(usersByDay || {}).map(([date, count]) => ({
        date,
        count
      }));
    }
  });

export default function Dashboard() {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
      
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 销售趋势图表 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">销售趋势</h2>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                sales: {
                  label: "销售额",
                  theme: {
                    light: "#0ea5e9",
                    dark: "#38bdf8",
                  },
                },
              }}
            >
              <AreaChart data={dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="sales"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </Card>

        {/* 用户增长图表 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">用户增长</h2>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                users: {
                  label: "新增用户",
                  theme: {
                    light: "#10b981",
                    dark: "#34d399",
                  },
                },
              }}
            >
              <BarChart data={dailyUsers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  name="users"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
