import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrendsData = (timeRange: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['dashboard-trends', timeRange],
    queryFn: async () => {
      // 获取订单数据（排除已删除的订单）
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
        .eq('is_deleted', false)
        .order('created_at');

      // 获取新用户数据
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
        .order('created_at');

      // 按日期分组处理销售额和用户数据
      const salesByDay: Record<string, number> = {};
      const usersByDay: Record<string, number> = {};

      // 初始化日期范围内的所有日期
      const currentDate = new Date(timeRange.start);
      while (currentDate <= timeRange.end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        salesByDay[dateStr] = 0;
        usersByDay[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 统计每日销售额
      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        salesByDay[date] = (salesByDay[date] || 0) + (order.total_amount || 0);
      });

      // 统计每日新增用户
      users?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        usersByDay[date] = (usersByDay[date] || 0) + 1;
      });

      // 统计订单状态分布
      const orderStatusCount: Record<string, number> = {};
      orders?.forEach(order => {
        orderStatusCount[order.status] = (orderStatusCount[order.status] || 0) + 1;
      });

      // 格式化趋势数据
      const trends = Object.keys(salesByDay).map(date => ({
        date,
        sales: Number(salesByDay[date].toFixed(2)),
        users: usersByDay[date] || 0
      })).sort((a, b) => a.date.localeCompare(b.date));

      // 格式化订单状态数据
      const orderStatus = Object.entries(orderStatusCount).map(([name, value]) => ({
        name: formatOrderStatus(name),
        value
      }));

      return {
        trends,
        orderStatus
      };
    },
    staleTime: 5 * 60 * 1000, // 数据5分钟内保持新鲜
    gcTime: 30 * 60 * 1000, // 缓存保留30分钟
    refetchOnWindowFocus: false, // 窗口获得焦点时不自动重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });
};

// 格式化订单状态显示
const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_payment': '待付款',
    'paid': '已付款',
    'shipped': '已发货',
    'delivered': '已送达',
    'completed': '已完成',
    'cancelled': '已取消',
    'refund_requested': '申请退款',
    'refunded': '已退款'
  };
  return statusMap[status] || status;
};