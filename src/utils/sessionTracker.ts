
import { supabase } from '@/integrations/supabase/client';

// 生成访客ID
export const generateVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// 生成会话ID
export const generateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// 获取设备信息
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType = 'desktop';
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = 'mobile';
  }

  // 简单的浏览器检测
  let browser = 'unknown';
  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

  // 操作系统检测
  let os = 'unknown';
  if (userAgent.indexOf('Windows') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('iOS') > -1) os = 'iOS';

  return {
    deviceType,
    browser,
    os,
    screenResolution: `${screen.width}x${screen.height}`,
    userAgent
  };
};

// 更新会话活动
export const updateSessionActivity = async () => {
  try {
    const visitorId = generateVisitorId();
    const sessionId = generateSessionId();
    const deviceInfo = getDeviceInfo();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.rpc('update_session_activity', {
      p_session_id: sessionId,
      p_visitor_id: visitorId,
      p_user_id: user?.id || null,
      p_user_agent: deviceInfo.userAgent
    });

    if (error) {
      console.error('更新会话活动失败:', error);
    }
  } catch (error) {
    console.error('会话跟踪错误:', error);
  }
};

// 记录页面访问
export const trackPageVisit = async (pagePath: string, pageTitle?: string) => {
  try {
    const visitorId = generateVisitorId();
    const sessionId = generateSessionId();
    const deviceInfo = getDeviceInfo();
    
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('page_visits')
      .insert({
        visitor_id: visitorId,
        user_id: user?.id || null,
        session_id: sessionId,
        page_path: pagePath,
        page_title: pageTitle || document.title,
        referrer: document.referrer || null,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screen_resolution: deviceInfo.screenResolution
      });

    if (error) {
      console.error('记录页面访问失败:', error);
    }
  } catch (error) {
    console.error('页面访问跟踪错误:', error);
  }
};
