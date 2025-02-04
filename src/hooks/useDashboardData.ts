import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, format, subDays, subMonths } from "date-fns";
import { TimeRange } from "@/types/dashboard";

export const useDashboardData = (timeRange: TimeRange, customDateRange: { from: Date; to: Date }) => {
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

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats', timeRange, customDateRange],
    queryFn: async () => {
      const { start, end } = getTimeRange();
      
      // 获取新增用户数
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // 获取用户总数 - 不需要时间范围过滤
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 获取活跃用户数（过去30天有订单的用户）
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: activeUsersData } = await supabase
        .from('orders')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .not('status', 'eq', 'payment_timeout');
      
      const activeUsers = new Set(activeUsersData?.map(order => order.user_id)).size;

      // 获取订单数据
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('is_deleted', 'eq', true);

      // 获取购物车商品数量 - 不需要时间范围过滤，显示当前购物车中的商品
      const { count: cartItems } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true });

      // 获取设计稿数量
      const { count: designs } = await supabase
        .from('design_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const totalOrders = orders?.length || 0;
      const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      return {
        newUsers: newUsers || 0,
        totalUsers: totalUsers || 0,
        activeUsers,
        totalOrders,
        totalSales,
        completedOrders,
        cartItems: cartItems || 0,
        designs: designs || 0,
        avgOrderValue
      };
    }
  });

  const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['dashboard-trends', timeRange, customDateRange],
    queryFn: async () => {
      const { start, end } = getTimeRange();
      
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('is_deleted', 'eq', true)
        .order('created_at');

      const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

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

      const orderStatusData = orders?.reduce((acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

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

  return { 
    statsData, 
    trendsData,
    isLoading: isStatsLoading || isTrendsLoading 
  };
};