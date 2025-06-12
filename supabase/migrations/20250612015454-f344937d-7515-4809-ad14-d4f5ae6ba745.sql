
-- 创建邮件测试发送记录表
CREATE TABLE email_test_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id),
  test_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  variables_used JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  tracking_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE email_test_sends ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己发送的测试邮件
CREATE POLICY "Users can view their own test sends" 
  ON email_test_sends 
  FOR SELECT 
  USING (auth.uid() = sent_by);

-- 创建策略：用户可以创建测试邮件发送记录
CREATE POLICY "Users can create test sends" 
  ON email_test_sends 
  FOR INSERT 
  WITH CHECK (auth.uid() = sent_by);

-- 创建策略：用户可以更新自己的测试邮件发送记录
CREATE POLICY "Users can update their own test sends" 
  ON email_test_sends 
  FOR UPDATE 
  USING (auth.uid() = sent_by);

-- 创建更新时间触发器
CREATE TRIGGER update_email_test_sends_updated_at
  BEFORE UPDATE ON email_test_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
