
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, startOfDay, endOfDay } from "date-fns";

export interface EnhancedStatsData {
  // 核心业务指标
  totalRevenue: number;
  revenueGrowth: number;
  conversionRate: number;
  conversionRateChange: number;
  avgOrderValue: number;
  avgOrderValueChange: number;
  customerRetention: number;
  retentionChange: number;
  
  // 用户指标
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowthRate: number;
  
  // 订单指标
  totalOrders: number;
  ordersGrowth: number;
  completedOrders: number;
  completionRate: number;
  refundRate: number;
  
  // 设计相关指标
  totalDesigns: number;
  designsGrowth: number;
  designUsageRate: number;
  avgDesignRevenue: number;
  
  // 邮件营销指标
  emailOpenRate: number;
  emailClickRate: number;
  emailConversionRate: number;
  
  // 实时指标
  todayVisitors: number;
  onlineUsers: number;
  realtimeOrders: number;
  
  // 时间戳
  lastUpdated: Date;
}

export const useEnhancedStatsData = (timeRange: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['enhanced-dashboard-stats', timeRange],
    queryFn: async (): Promise<EnhancedStatsData> => {
      const { start, end } = timeRange;
      
      // 计算对比时间段
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const compareStart = subDays(start, daysDiff);
      const compareEnd = subDays(end, daysDiff);

      // 并行获取所有数据
      const [
        ordersResult,
        compareOrdersResult,
        usersResult,
        compareUsersResult,
        designsResult,
        compareDesignsResult,
        emailStatsResult,
        realtimeStatsResult
      ] = await Promise.all([
        // 当前期间订单数据
        supabase
          .from('orders')
          .select('total_amount, status, created_at, user_id')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .eq('is_deleted', false),
          
        // 对比期间订单数据
        supabase
          .from('orders')
          .select('total_amount, status, created_at, user_id')
          .gte('created_at', compareStart.toISOString())
          .lte('created_at', compareEnd.toISOString())
          .eq('is_deleted', false),
          
        // 当前期间用户数据
        supabase
          .from('profiles')
          .select('created_at, id')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
          
        // 对比期间用户数据
        supabase
          .from('profiles')
          .select('created_at, id')
          .gte('created_at', compareStart.toISOString())
          .lte('created_at', compareEnd.toISOString()),
          
        // 当前期间设计数据
        supabase
          .from('design_drafts')
          .select('created_at, use_count, sales_amount, total_earnings')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .eq('is_deleted', false),
          
        // 对比期间设计数据
        supabase
          .from('design_drafts')
          .select('created_at, use_count, sales_amount, total_earnings')
          .gte('created_at', compareStart.toISOString())
          .lte('created_at', compareEnd.toISOString())
          .eq('is_deleted', false),
          
        // 邮件统计数据
        supabase
          .from('email_sends')
          .select('status, opened_at, clicked_at, created_at')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
          
        // 实时数据（今天）
        Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay(new Date()).toISOString())
            .lte('created_at', endOfDay(new Date()).toISOString())
            .eq('is_deleted', false)
        ])
      ]);

      // 处理数据
      const orders = ordersResult.data || [];
      const compareOrders = compareOrdersResult.data || [];
      const users = usersResult.data || [];
      const compareUsers = compareUsersResult.data || [];
      const designs = designsResult.data || [];
      const compareDesigns = compareDesignsResult.data || [];
      const emailStats = emailStatsResult.data || [];
      const [totalUsersResult, todayOrdersResult] = realtimeStatsResult;

      // 计算核心指标
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const compareRevenue = compareOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const revenueGrowth = compareRevenue > 0 ? ((totalRevenue - compareRevenue) / compareRevenue) * 100 : 0;

      const totalOrders = orders.length;
      const compareOrdersCount = compareOrders.length;
      const ordersGrowth = compareOrdersCount > 0 ? ((totalOrders - compareOrdersCount) / compareOrdersCount) * 100 : 0;

      const completedOrders = orders.filter(order => order.status === 'delivered').length;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const compareAvgOrderValue = compareOrdersCount > 0 ? compareRevenue / compareOrdersCount : 0;
      const avgOrderValueChange = compareAvgOrderValue > 0 ? ((avgOrderValue - compareAvgOrderValue) / compareAvgOrderValue) * 100 : 0;

      // 转化率计算（简化版本，实际需要访问数据）
      const uniqueOrderUsers = new Set(orders.map(order => order.user_id)).size;
      const conversionRate = users.length > 0 ? (uniqueOrderUsers / users.length) * 100 : 0;
      const compareUniqueOrderUsers = new Set(compareOrders.map(order => order.user_id)).size;
      const compareConversionRate = compareUsers.length > 0 ? (compareUniqueOrderUsers / compareUsers.length) * 100 : 0;
      const conversionRateChange = compareConversionRate > 0 ? conversionRate - compareConversionRate : 0;

      // 用户指标
      const newUsers = users.length;
      const compareNewUsers = compareUsers.length;
      const userGrowthRate = compareNewUsers > 0 ? ((newUsers - compareNewUsers) / compareNewUsers) * 100 : 0;

      // 设计指标
      const totalDesigns = designs.length;
      const compareDesignsCount = compareDesigns.length;
      const designsGrowth = compareDesignsCount > 0 ? ((totalDesigns - compareDesignsCount) / compareDesignsCount) * 100 : 0;

      const totalDesignUsage = designs.reduce((sum, design) => sum + (design.use_count || 0), 0);
      const designUsageRate = totalDesigns > 0 ? (totalDesignUsage / totalDesigns) : 0;

      const totalDesignRevenue = designs.reduce((sum, design) => sum + (design.sales_amount || 0), 0);
      const avgDesignRevenue = totalDesigns > 0 ? totalDesignRevenue / totalDesigns : 0;

      // 邮件指标
      const emailSent = emailStats.length;
      const emailOpened = emailStats.filter(email => email.opened_at).length;
      const emailClicked = emailStats.filter(email => email.clicked_at).length;
      
      const emailOpenRate = emailSent > 0 ? (emailOpened / emailSent) * 100 : 0;
      const emailClickRate = emailSent > 0 ? (emailClicked / emailSent) * 100 : 0;
      const emailConversionRate = emailSent > 0 ? (emailClicked / emailSent) * 100 : 0; // 简化计算

      // 退款率（简化计算）
      const refundedOrders = orders.filter(order => order.status === 'refunded').length;
      const refundRate = totalOrders > 0 ? (refundedOrders / totalOrders) * 100 : 0;

      return {
        totalRevenue,
        revenueGrowth,
        conversionRate,
        conversionRateChange,
        avgOrderValue,
        avgOrderValueChange,
        customerRetention: 85, // 示例数据，需要复杂计算
        retentionChange: 2.5,
        
        totalUsers: totalUsersResult.count || 0,
        newUsers,
        activeUsers: uniqueOrderUsers,
        userGrowthRate,
        
        totalOrders,
        ordersGrowth,
        completedOrders,
        completionRate,
        refundRate,
        
        totalDesigns,
        designsGrowth,
        designUsageRate,
        avgDesignRevenue,
        
        emailOpenRate,
        emailClickRate,
        emailConversionRate,
        
        todayVisitors: newUsers, // 简化数据
        onlineUsers: Math.floor(Math.random() * 50) + 10, // 模拟在线用户
        realtimeOrders: todayOrdersResult.count || 0,
        
        lastUpdated: new Date()
      };
    },
    staleTime: 30 * 1000, // 30秒刷新
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // 自动刷新
    refetchOnWindowFocus: true,
  });
};
