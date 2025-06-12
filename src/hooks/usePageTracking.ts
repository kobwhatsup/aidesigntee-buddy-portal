
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit } from '@/utils/sessionTracker';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // 页面路由变化时记录访问
    const trackCurrentPage = async () => {
      await trackPageVisit(location.pathname);
    };

    trackCurrentPage();
  }, [location.pathname]);
}
