
-- 创建预设模板表
CREATE TABLE public.email_template_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- 创建图片资源表
CREATE TABLE public.email_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags TEXT[],
  alt_text TEXT
);

-- 创建图片存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('email-images', 'email-images', true);

-- 为图片存储桶创建宽松的策略
CREATE POLICY "Allow all operations on email-images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'email-images');

-- 为预设模板表启用 RLS 
ALTER TABLE public.email_template_presets ENABLE ROW LEVEL SECURITY;

-- 允许所有用户查看预设模板
CREATE POLICY "Allow all to view template presets" 
ON public.email_template_presets FOR SELECT 
USING (true);

-- 只允许管理员管理预设模板
CREATE POLICY "Allow admins to manage template presets" 
ON public.email_template_presets FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

-- 为图片表启用 RLS
ALTER TABLE public.email_images ENABLE ROW LEVEL SECURITY;

-- 允许所有用户查看图片
CREATE POLICY "Allow all to view images" 
ON public.email_images FOR SELECT 
USING (true);

-- 允许认证用户上传图片
CREATE POLICY "Allow authenticated users to upload images" 
ON public.email_images FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 允许用户管理自己上传的图片
CREATE POLICY "Allow users to manage their own images" 
ON public.email_images FOR ALL 
USING (uploaded_by = auth.uid());

-- 插入一些预设模板示例数据
INSERT INTO public.email_template_presets (name, description, category, template_data) VALUES
(
  '欢迎新用户',
  '用于欢迎新注册用户的邮件模板',
  'welcome',
  '{
    "elements": [
      {
        "id": "header-1",
        "type": "header",
        "content": "欢迎加入 {{website_name}}！",
        "styles": {
          "fontSize": "28px",
          "fontWeight": "bold",
          "textAlign": "center",
          "color": "#333333",
          "padding": "24px"
        },
        "order": 0
      },
      {
        "id": "text-1",
        "type": "text",
        "content": "亲爱的 {{username}}，<br><br>感谢您注册我们的服务！我们很高兴您加入我们的社区。",
        "styles": {
          "fontSize": "16px",
          "lineHeight": "1.6",
          "color": "#333333",
          "padding": "16px"
        },
        "order": 1
      },
      {
        "id": "button-1",
        "type": "button",
        "content": "开始探索",
        "styles": {
          "backgroundColor": "#007bff",
          "color": "#ffffff",
          "padding": "12px 32px",
          "borderRadius": "6px",
          "textAlign": "center",
          "display": "block",
          "margin": "24px auto",
          "textDecoration": "none",
          "fontSize": "16px",
          "fontWeight": "bold"
        },
        "order": 2
      }
    ]
  }'
),
(
  '营销推广模板',
  '用于产品促销和营销活动的邮件模板',
  'promotional',
  '{
    "elements": [
      {
        "id": "header-1",
        "type": "header",
        "content": "🎉 限时优惠活动",
        "styles": {
          "fontSize": "24px",
          "fontWeight": "bold",
          "textAlign": "center",
          "color": "#e74c3c",
          "padding": "20px"
        },
        "order": 0
      },
      {
        "id": "image-1",
        "type": "image",
        "content": "https://via.placeholder.com/600x200/007bff/ffffff?text=产品展示",
        "styles": {
          "width": "100%",
          "height": "auto",
          "margin": "16px 0"
        },
        "order": 1
      },
      {
        "id": "text-1",
        "type": "text",
        "content": "尊敬的 {{username}}，<br><br>我们为您准备了特别优惠！现在购买任意商品即可享受 <strong>8折优惠</strong>。",
        "styles": {
          "fontSize": "16px",
          "lineHeight": "1.6",
          "color": "#333333",
          "padding": "16px"
        },
        "order": 2
      },
      {
        "id": "button-1",
        "type": "button",
        "content": "立即购买",
        "styles": {
          "backgroundColor": "#e74c3c",
          "color": "#ffffff",
          "padding": "14px 36px",
          "borderRadius": "8px",
          "textAlign": "center",
          "display": "block",
          "margin": "24px auto",
          "textDecoration": "none",
          "fontSize": "18px",
          "fontWeight": "bold"
        },
        "order": 3
      }
    ]
  }'
);
