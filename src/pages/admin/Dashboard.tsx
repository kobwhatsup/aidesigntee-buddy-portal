import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChartBar, Users, ShoppingCart, Calendar, DollarSign, Package, UserPlus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChartContainer, 
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, format, subDays, subMonths, subYears } from "date-fns";

type TimeRange = 'today' | 'yesterday' | 'this_month' | 'last_month' | 'this_year' | 'custom';
type ChangeType = 'increase' | 'decrease' | 'neutral';

type StatItem = {
  name: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: ChangeType;
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [customDateRange, setCustomDateRange] = useState<{from: Date; to: Date}>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  const getTimeRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        return { 
          start: startOfDay(subDays(now, 1)), 
          end: endOfDay(subDays(now, 1)) 
        };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month':
        return { 
          start: startOfMonth(subMonths(now, 1)), 
          end: endOfMonth(subMonths(now, 1)) 
        };
      case 'this_year':
        return { start: startOfYear(now), end: now };
      case 'custom':
        return { 
          start: startOfDay(customDateRange.from), 
          end: endOfDay(customDateRange.to) 
        };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', timeRange, customDateRange],
    queryFn: async () => {
      const { start, end } = getTimeRange();
      
      // 用户统计
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // 订单统计
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // 购物车统计
      const { count: cartItems } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // 设计稿统计
      const { count: designs } = await supabase
        .from('design_drafts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // 计算订单相关数据
      const totalOrders = orders?.length || 0;
      const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending_payment').length || 0;
      const processingOrders = orders?.filter(order => ['paid', 'processing', 'shipped'].includes(order.status)).length || 0;

      // 计算平均订单金额
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      return {
        newUsers: newUsers || 0,
        totalOrders,
        totalSales,
        completedOrders,
        pendingOrders,
        processingOrders,
        cartItems: cartItems || 0,
        designs: designs || 0,
        avgOrderValue
      };
    }
  });

  // 获取趋势数据
  const { data: trendsData } = useQuery({
    queryKey: ['dashboard-trends', timeRange, customDateRange],
    queryFn: async () => {
      const { start, end } = getTimeRange();
      
      // 获取订单数据
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      // 获取用户注册数据
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      // 处理数据按日期分组
      const salesByDay = orders?.reduce((acc: any, order) => {
        const date = format(new Date(order.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + (order.total_amount || 0);
        return acc;
      }, {});

      const usersByDay = users?.reduce((acc: any, user) => {
        const date = format(new Date(user.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // 订单状态分布
      const orderStatusData = orders?.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // 合并数据
      const dates = new Set([
        ...Object.keys(salesByDay || {}),
        ...Object.keys(usersByDay || {})
      ]);

      return {
        trends: Array.from(dates).map(date => ({
          date,
          sales: salesByDay?.[date] || 0,
          users: usersByDay?.[date] || 0
        })).sort((a, b) => a.date.localeCompare(b.date)),
        orderStatus: Object.entries(orderStatusData || {}).map(([name, value]) => ({
          name,
          value
        }))
      };
    }
  });

  const stats: StatItem[] = [
    {
      name: "新增用户",
      value: statsData?.newUsers?.toString() || "0",
      icon: UserPlus,
      change: "+23%",
      changeType: "increase",
    },
    {
      name: "订单总数",
      value: statsData?.totalOrders?.toString() || "0",
      icon: Package,
      change: statsData?.completedOrders ? `已完成: ${statsData.completedOrders}` : "0",
      changeType: "neutral",
    },
    {
      name: "销售额",
      value: statsData?.totalSales ? `¥${statsData.totalSales.toFixed(2)}` : "¥0",
      icon: DollarSign,
      change: `平均订单: ¥${(statsData?.avgOrderValue || 0).toFixed(2)}`,
      changeType: "increase",
    },
    {
      name: "购物车商品",
      value: statsData?.cartItems?.toString() || "0",
      icon: ShoppingCart,
      change: "待结算",
      changeType: "neutral",
    },
    {
      name: "设计稿数量",
      value: statsData?.designs?.toString() || "0",
      icon: ChartBar,
      change: "新增",
      changeType: "neutral",
    },
    {
      name: "待处理订单",
      value: statsData?.processingOrders?.toString() || "0",
      icon: Package,
      change: `待付款: ${statsData?.pendingOrders || 0}`,
      changeType: "neutral",
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="yesterday">昨日</SelectItem>
              <SelectItem value="this_month">本月</SelectItem>
              <SelectItem value="last_month">上月</SelectItem>
              <SelectItem value="this_year">今年</SelectItem>
              <SelectItem value="custom">自定义</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <DateRangePicker
              from={customDateRange.from}
              to={customDateRange.to}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setCustomDateRange({ from: range.from, to: range.to });
                }
              }}
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <AreaChart data={trendsData?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
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
              <BarChart data={trendsData?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="users"
                  name="users"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        {/* 订单状态分布图表 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">订单状态分布</h2>
          <div className="h-[300px] flex items-center justify-center">
            <ChartContainer
              config={{
                status: {
                  label: "订单状态",
                  theme: {
                    light: "#8884d8",
                    dark: "#8884d8",
                  },
                },
              }}
            >
              <PieChart width={400} height={300}>
                <Pie
                  data={trendsData?.orderStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trendsData?.orderStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {trendsData?.orderStatus?.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
