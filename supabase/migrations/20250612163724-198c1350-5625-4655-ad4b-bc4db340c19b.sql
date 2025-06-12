
-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  visitor_id VARCHAR(255) NOT NULL, -- 用于匿名用户标识
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建页面访问记录表
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(500),
  referrer TEXT,
  visit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exit_time TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- 页面停留时间（秒）
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(100),
  os VARCHAR(100),
  screen_resolution VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建访客统计汇总表（用于快速查询）
CREATE TABLE IF NOT EXISTS visitor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为表启用RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 管理员可以查看所有数据
CREATE POLICY "Admins can view all user sessions" 
  ON user_sessions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert user sessions" 
  ON user_sessions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own session" 
  ON user_sessions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can view all page visits" 
  ON page_visits 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert page visits" 
  ON page_visits 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view visitor stats" 
  ON visitor_stats 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_visitor_id ON user_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visit_time ON page_visits(visit_time);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_id ON page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_date ON visitor_stats(date);

-- 创建函数来更新会话最后活动时间
CREATE OR REPLACE FUNCTION update_session_activity(
  p_session_id VARCHAR,
  p_visitor_id VARCHAR,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_sessions (
    session_id, 
    visitor_id, 
    user_id, 
    ip_address, 
    user_agent, 
    last_activity
  )
  VALUES (
    p_session_id, 
    p_visitor_id, 
    p_user_id, 
    p_ip_address, 
    p_user_agent, 
    NOW()
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET 
    last_activity = NOW(),
    user_id = COALESCE(p_user_id, user_sessions.user_id),
    is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 创建函数来获取在线用户数
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS INTEGER AS $$
BEGIN
  -- 返回5分钟内有活动的用户数
  RETURN (
    SELECT COUNT(DISTINCT visitor_id)
    FROM user_sessions 
    WHERE last_activity > NOW() - INTERVAL '5 minutes'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- 创建函数来获取今日访客数
CREATE OR REPLACE FUNCTION get_today_visitors_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT visitor_id)
    FROM page_visits 
    WHERE DATE(visit_time) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务清理过期会话（需要pg_cron扩展）
-- 这个函数可以手动调用或通过定时任务执行
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS VOID AS $$
BEGIN
  -- 将1小时前的会话标记为非活跃
  UPDATE user_sessions 
  SET is_active = false 
  WHERE last_activity < NOW() - INTERVAL '1 hour'
  AND is_active = true;
  
  -- 删除7天前的会话记录
  DELETE FROM user_sessions 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
