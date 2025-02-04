import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useTrendsData = (timeRange: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['dashboard-trends', timeRange],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
        .not('is_deleted', 'eq', true)
        .order('created_at');

      const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
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
    },
    staleTime: 5 * 60 * 1000, // 数据5分钟内保持新鲜
    gcTime: 30 * 60 * 1000, // 缓存保留30分钟
    refetchOnWindowFocus: false, // 窗口获得焦点时不自动重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });
};