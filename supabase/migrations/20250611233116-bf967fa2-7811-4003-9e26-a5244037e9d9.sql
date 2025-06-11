
-- 创建A/B测试表
CREATE TABLE email_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'paused')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  campaign_id UUID REFERENCES email_campaigns(id),
  test_type VARCHAR(50) DEFAULT 'subject_line',
  confidence_level NUMERIC DEFAULT 95,
  winner_variant VARCHAR(10),
  statistical_significance NUMERIC,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建A/B测试变体表
CREATE TABLE email_ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES email_ab_tests(id) ON DELETE CASCADE,
  variant_name VARCHAR(10) NOT NULL, -- 'A', 'B', 'C' etc
  template_id UUID REFERENCES email_templates(id),
  subject_line VARCHAR(500),
  traffic_percentage NUMERIC DEFAULT 50,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建自动化执行历史表
CREATE TABLE email_automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES email_automation_rules(id),
  user_id UUID,
  trigger_event JSONB,
  execution_status VARCHAR(20) DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  email_sent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建邮件打开/点击跟踪表
CREATE TABLE email_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_send_id UUID REFERENCES email_sends(id),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建邮件性能监控表
CREATE TABLE email_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引优化查询性能
CREATE INDEX idx_ab_tests_status ON email_ab_tests(status);
CREATE INDEX idx_ab_tests_dates ON email_ab_tests(start_date, end_date);
CREATE INDEX idx_ab_test_variants_test_id ON email_ab_test_variants(test_id);
CREATE INDEX idx_automation_executions_rule_id ON email_automation_executions(rule_id);
CREATE INDEX idx_automation_executions_user_id ON email_automation_executions(user_id);
CREATE INDEX idx_automation_executions_status ON email_automation_executions(execution_status);
CREATE INDEX idx_tracking_events_email_send_id ON email_tracking_events(email_send_id);
CREATE INDEX idx_tracking_events_type ON email_tracking_events(event_type);
CREATE INDEX idx_performance_metrics_type ON email_performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_time ON email_performance_metrics(recorded_at);

-- 启用RLS
ALTER TABLE email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_performance_metrics ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "管理员可以管理A/B测试" ON email_ab_tests FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "管理员可以管理A/B测试变体" ON email_ab_test_variants FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "管理员可以查看自动化执行历史" ON email_automation_executions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "管理员可以查看跟踪事件" ON email_tracking_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "管理员可以查看性能指标" ON email_performance_metrics FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

-- 创建更新时间触发器
CREATE TRIGGER update_email_ab_tests_updated_at BEFORE UPDATE ON email_ab_tests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_ab_test_variants_updated_at BEFORE UPDATE ON email_ab_test_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_automation_executions_updated_at BEFORE UPDATE ON email_automation_executions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建统计函数
CREATE OR REPLACE FUNCTION calculate_ab_test_significance(
  test_id UUID,
  variant_a VARCHAR(10),
  variant_b VARCHAR(10)
) 
RETURNS NUMERIC AS $$
DECLARE
  conv_a NUMERIC;
  conv_b NUMERIC;
  sent_a NUMERIC;
  sent_b NUMERIC;
  p1 NUMERIC;
  p2 NUMERIC;
  p_pooled NUMERIC;
  se NUMERIC;
  z_score NUMERIC;
  significance NUMERIC;
BEGIN
  -- 获取变体A的数据
  SELECT conversion_count, sent_count INTO conv_a, sent_a
  FROM email_ab_test_variants 
  WHERE test_id = test_id AND variant_name = variant_a;
  
  -- 获取变体B的数据
  SELECT conversion_count, sent_count INTO conv_b, sent_b
  FROM email_ab_test_variants 
  WHERE test_id = test_id AND variant_name = variant_b;
  
  -- 计算转化率
  p1 := conv_a / sent_a;
  p2 := conv_b / sent_b;
  
  -- 计算合并转化率
  p_pooled := (conv_a + conv_b) / (sent_a + sent_b);
  
  -- 计算标准误差
  se := sqrt(p_pooled * (1 - p_pooled) * (1/sent_a + 1/sent_b));
  
  -- 计算Z分数
  z_score := abs(p1 - p2) / se;
  
  -- 简化的显著性计算（实际应用中需要更复杂的统计计算）
  significance := CASE 
    WHEN z_score > 2.576 THEN 99
    WHEN z_score > 1.96 THEN 95
    WHEN z_score > 1.645 THEN 90
    ELSE 0
  END;
  
  RETURN significance;
END;
$$ LANGUAGE plpgsql;
