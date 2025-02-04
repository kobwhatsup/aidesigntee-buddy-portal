import { useState } from "react";
import { ChartBar, Users, ShoppingCart, DollarSign, Package, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, format, subDays, subMonths } from "date-fns";
import { TimeRangeSelector } from "@/components/admin/dashboard/TimeRangeSelector";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { UserGrowthChart } from "@/components/admin/dashboard/UserGrowthChart";
import { OrderStatusChart } from "@/components/admin/dashboard/OrderStatusChart";
import { TimeRange, StatItem } from "@/types/dashboard";

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
        .select('total_amount, status')
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
      const salesByDay = orders?.reduce((acc: Record<string, number>, order) => {
        const date = format(new Date(order.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + (order.total_amount || 0);
        return acc;
      }, {});

      const usersByDay = users?.reduce((acc: Record<string, number>, user) => {
        const date = format(new Date(user.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // 订单状态分布
      const orderStatusData = orders?.reduce((acc: Record<string, number>, order) => {
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
          value: value as number
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        <TimeRangeSelector
          timeRange={timeRange}
          customDateRange={customDateRange}
          onTimeRangeChange={setTimeRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart data={trendsData?.trends || []} />
        <UserGrowthChart data={trendsData?.trends || []} />
        <OrderStatusChart data={trendsData?.orderStatus || []} />
      </div>
    </div>
  );
}