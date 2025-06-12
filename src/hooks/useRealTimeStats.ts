
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { updateSessionActivity, trackPageVisit } from '@/utils/sessionTracker';

interface RealTimeStats {
  onlineUsers: number;
  todayVisitors: number;
  realtimeOrders: number;
  isLoading: boolean;
}

export function useRealTimeStats() {
  const [stats, setStats] = useState<RealTimeStats>({
    onlineUsers: 0,
    todayVisitors: 0,
    realtimeOrders: 0,
    isLoading: true
  });

  // 获取实时统计数据
  const fetchStats = async () => {
    try {
      // 获取在线用户数
      const { data: onlineData, error: onlineError } = await supabase
        .rpc('get_online_users_count');

      if (onlineError) {
        console.error('获取在线用户数失败:', onlineError);
      }

      // 获取今日访客数
      const { data: visitorsData, error: visitorsError } = await supabase
        .rpc('get_today_visitors_count');

      if (visitorsError) {
        console.error('获取今日访客数失败:', visitorsError);
      }

      // 获取今日订单数
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
        .not('is_deleted', 'eq', true);

      if (ordersError) {
        console.error('获取今日订单数失败:', ordersError);
      }

      setStats({
        onlineUsers: onlineData || 0,
        todayVisitors: visitorsData || 0,
        realtimeOrders: ordersCount || 0,
        isLoading: false
      });
    } catch (error) {
      console.error('获取实时统计数据失败:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 初始化会话跟踪
  useEffect(() => {
    const initializeTracking = async () => {
      // 记录页面访问
      await trackPageVisit(window.location.pathname);
      
      // 更新会话活动
      await updateSessionActivity();
      
      // 获取初始统计数据
      await fetchStats();
    };

    initializeTracking();

    // 设置心跳机制 - 每30秒更新一次会话活动
    const heartbeatInterval = setInterval(async () => {
      await updateSessionActivity();
    }, 30000);

    // 设置统计数据更新 - 每分钟更新一次
    const statsInterval = setInterval(fetchStats, 60000);

    // 页面可见性变化时的处理
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateSessionActivity();
      }
    };

    // 页面卸载时的处理
    const handleBeforeUnload = () => {
      // 标记会话为非活跃（这里可以发送beacon请求）
      navigator.sendBeacon && navigator.sendBeacon('/api/track/session-end', JSON.stringify({
        sessionId: sessionStorage.getItem('session_id'),
        timestamp: Date.now()
      }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(statsInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 监听路由变化
  useEffect(() => {
    const handleRouteChange = () => {
      trackPageVisit(window.location.pathname);
    };

    // 监听浏览器历史变化
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return {
    ...stats,
    refresh: fetchStats
  };
}
