import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export const useStatsData = (timeRange: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: async () => {
      // 获取新增用户数
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

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

      // 获取订单数据 - 包括所有状态的订单，但排除已删除的
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .not('is_deleted', 'eq', true);

      // 获取购物车商品数量总和
      const { data: cartItemsData } = await supabase
        .from('cart_items')
        .select('quantity');

      const cartItemsTotal = cartItemsData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

      // 获取设计稿数量
      const { count: designs } = await supabase
        .from('design_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

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
        cartItems: cartItemsTotal,
        designs: designs || 0,
        avgOrderValue
      };
    },
    staleTime: 5 * 60 * 1000, // 数据5分钟内保持新鲜
    gcTime: 30 * 60 * 1000, // 缓存保留30分钟
    refetchOnWindowFocus: false, // 窗口获得焦点时不自动重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });
};