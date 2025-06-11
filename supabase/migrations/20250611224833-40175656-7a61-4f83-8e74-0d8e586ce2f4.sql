
-- 插入邮件模板数据
INSERT INTO email_templates (name, subject, template_type, html_content, text_content, is_active, variables) VALUES

-- 用户注册欢迎系列
('用户注册欢迎邮件', '欢迎加入AIDESIGNTEE - 开启您的创意设计之旅！', 'welcome', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
.content { padding: 30px 20px; }
.button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
.footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
</style></head><body>
<div class="container">
<div class="header">
<h1>🎨 欢迎加入AIDESIGNTEE！</h1>
<p>您的创意设计之旅从这里开始</p>
</div>
<div class="content">
<h2>Hi {{username}}，</h2>
<p>感谢您加入AIDESIGNTEE！我们很兴奋能与您一起开启这段创意设计之旅。</p>
<p>在AIDESIGNTEE，您可以：</p>
<ul>
<li>🎨 使用AI工具创建独特的T恤设计</li>
<li>🛍️ 一键下单，快速制作您的专属T恤</li>
<li>💰 分享您的设计，赚取设计奖励</li>
<li>🌟 发现其他设计师的精彩作品</li>
</ul>
<div style="text-align: center;">
<a href="{{website_url}}" class="button">开始设计您的第一件T恤</a>
</div>
<p>如果您有任何问题，随时联系我们的客服团队。我们期待看到您的精彩设计！</p>
</div>
<div class="footer">
<p>AIDESIGNTEE团队<br>让每一件T恤都独一无二</p>
</div>
</div>
</body></html>', 
'欢迎加入AIDESIGNTEE！感谢您的注册，开始您的创意设计之旅吧！', true, 
'{"username": "用户名", "website_url": "网站链接"}'),

-- 产品介绍邮件
('产品功能介绍', '探索AIDESIGNTEE的强大功能 - 让设计更简单', 'notification', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: #2563eb; color: white; padding: 30px 20px; text-align: center; }
.feature { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
.button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }
</style></head><body>
<div class="container">
<div class="header">
<h1>🚀 AIDESIGNTEE功能指南</h1>
</div>
<div style="padding: 20px;">
<p>Hi {{username}}，</p>
<p>注册24小时了，让我们来深入了解AIDESIGNTEE的强大功能吧！</p>

<div class="feature">
<h3>🎨 AI智能设计</h3>
<p>只需输入创意描述，AI将为您生成独特的设计图案。支持多种风格和主题。</p>
</div>

<div class="feature">
<h3>🛍️ 一键定制</h3>
<p>选择T恤款式、颜色、尺码，预览效果，轻松下单制作您的专属T恤。</p>
</div>

<div class="feature">
<h3>💰 设计师奖励</h3>
<p>将您的设计设为公开，其他用户使用时您将获得10%的奖励分成。</p>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="{{design_url}}" class="button">立即开始设计</a>
</div>
</div>
</div>
</body></html>', 
'探索AIDESIGNTEE的AI设计、一键定制、设计师奖励等功能。', true, 
'{"username": "用户名", "design_url": "设计页面链接"}'),

-- 限时优惠邮件
('新用户限时优惠', '🎉 专属新用户福利 - 首单享8折优惠！', 'promotional', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; padding: 40px 20px; text-align: center; }
.coupon { background: #fff3cd; border: 2px dashed #ffc107; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
.button { background: #ff6b6b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; }
</style></head><body>
<div class="container">
<div class="header">
<h1>🎉 新用户专享优惠！</h1>
<p>限时3天，首单立享8折</p>
</div>
<div style="padding: 20px;">
<p>Hi {{username}}，</p>
<p>感谢您注册AIDESIGNTEE！为了庆祝您的加入，我们为您准备了一份特别的新用户礼物：</p>

<div class="coupon">
<h2 style="color: #d63384; margin: 0;">8折优惠券</h2>
<p style="font-size: 24px; font-weight: bold; color: #ffc107; margin: 10px 0;">WELCOME20</p>
<p>首单购买任意T恤享受8折优惠<br>
<strong>有效期：3天</strong></p>
</div>

<p>🎨 现在就来设计您的第一件专属T恤吧！无论是个人创意还是送礼，都是完美选择。</p>

<div style="text-align: center; margin: 30px 0;">
<a href="{{shop_url}}" class="button">立即使用优惠券</a>
</div>

<p style="color: #666; font-size: 14px;">* 优惠券仅限首次购买使用，不与其他优惠同享</p>
</div>
</div>
</body></html>', 
'新用户专享8折优惠券WELCOME20，限时3天有效，快来设计您的第一件T恤吧！', true, 
'{"username": "用户名", "shop_url": "商店链接"}'),

-- 购物车放弃提醒
('购物车商品提醒', '您的设计还在等您 - 别让灵感溜走了！', 'abandoned_cart', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: #8b5cf6; color: white; padding: 30px 20px; text-align: center; }
.product { border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
.button { background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }
</style></head><body>
<div class="container">
<div class="header">
<h1>🛍️ 您的设计还在等您</h1>
</div>
<div style="padding: 20px;">
<p>Hi {{username}}，</p>
<p>我们注意到您选择了一件很棒的设计，但还没有完成订单。您的创意设计正在购物车中等待您：</p>

<div class="product">
<h3>{{product_name}}</h3>
<p>设计：{{design_title}}</p>
<p>尺码：{{size}} | 颜色：{{color}}</p>
<p style="font-size: 18px; color: #8b5cf6; font-weight: bold;">￥{{price}}</p>
</div>

<p>🎨 为了确保您不错过这个精彩的设计，我们为您保留了24小时。</p>
<p>⚡ 现在完成订单，最快3-5天就能收到您的专属T恤！</p>

<div style="text-align: center; margin: 30px 0;">
<a href="{{cart_url}}" class="button">完成订单</a>
</div>

<p style="color: #666;">如果您在订购过程中遇到任何问题，请随时联系我们的客服团队。</p>
</div>
</div>
</body></html>', 
'您的设计还在购物车等待，现在完成订单最快3-5天收到专属T恤！', true, 
'{"username": "用户名", "product_name": "商品名称", "design_title": "设计标题", "size": "尺码", "color": "颜色", "price": "价格", "cart_url": "购物车链接"}'),

-- 用户重新激活
('想念您的邮件', '我们想念您了 - 回来看看有什么新变化！', 'user_activation', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; }
.highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
.button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }
</style></head><body>
<div class="container">
<div class="header">
<h1>💖 我们想念您了！</h1>
<p>AIDESIGNTEE有很多新变化等您来发现</p>
</div>
<div style="padding: 20px;">
<p>Hi {{username}}，</p>
<p>好久不见！我们注意到您已经有一段时间没有访问AIDESIGNTEE了。在您离开的这段时间里，我们有了很多令人兴奋的更新：</p>

<div class="highlight">
<h3>🆕 最新功能</h3>
<ul>
<li>新增10+种T恤款式选择</li>
<li>AI设计速度提升50%</li>
<li>新的设计风格和主题</li>
<li>改进的设计预览功能</li>
</ul>
</div>

<p>🎨 您之前创建的设计仍然保存在您的账户中，随时可以继续编辑或下单制作。</p>
<p>🌟 另外，很多用户都在分享他们的创意设计，收获了不少设计奖励呢！</p>

<div style="text-align: center; margin: 30px 0;">
<a href="{{dashboard_url}}" class="button">回来看看新变化</a>
</div>

<p>期待再次见到您的创意！</p>
</div>
</div>
</body></html>', 
'我们想念您了！AIDESIGNTEE有很多新功能和改进，回来看看吧！', true, 
'{"username": "用户名", "dashboard_url": "用户面板链接"}'),

-- 订单确认邮件
('订单确认通知', '订单确认 - 您的专属T恤正在制作中', 'order_confirmation', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: #10b981; color: white; padding: 30px 20px; text-align: center; }
.order-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
.status { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; display: inline-block; }
</style></head><body>
<div class="container">
<div class="header">
<h1>✅ 订单确认成功！</h1>
<p>订单号：{{order_number}}</p>
</div>
<div style="padding: 20px;">
<p>Hi {{username}}，</p>
<p>感谢您的订购！我们已经确认收到您的订单，现在开始为您制作专属T恤。</p>

<div class="order-info">
<h3>订单详情</h3>
<p><strong>订单号：</strong>{{order_number}}</p>
<p><strong>商品：</strong>{{product_name}}</p>
<p><strong>设计：</strong>{{design_title}}</p>
<p><strong>规格：</strong>{{size}} | {{color}}</p>
<p><strong>数量：</strong>{{quantity}}件</p>
<p><strong>总金额：</strong>￥{{total_amount}}</p>
<p><strong>收货地址：</strong>{{shipping_address}}</p>
</div>

<div style="text-align: center; margin: 20px 0;">
<span class="status">制作中</span>
</div>

<h3>接下来会发生什么？</h3>
<ul>
<li>📦 我们将在1-2个工作日内开始制作您的T恤</li>
<li>🚚 制作完成后立即安排发货</li>
<li>📱 您将收到物流追踪信息</li>
<li>🏠 预计3-5个工作日送达</li>
</ul>

<p>您可以随时在账户中查看订单状态。如有任何问题，请联系我们的客服团队。</p>
</div>
</div>
</body></html>', 
'订单{{order_number}}确认成功！您的专属T恤正在制作中，预计3-5个工作日送达。', true, 
'{"username": "用户名", "order_number": "订单号", "product_name": "商品名称", "design_title": "设计标题", "size": "尺码", "color": "颜色", "quantity": "数量", "total_amount": "总金额", "shipping_address": "收货地址"}'),

-- 新功能发布通知
('新功能发布', '🚀 AIDESIGNTEE重大更新 - 全新功能等您体验！', 'notification', 
'<html><head><style>
.container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
.feature-card { background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }
</style></head><body>
<div class="container">
<div class="header">
<h1>🚀 重大更新发布！</h1>
<p>AIDESIGNTEE迎来全新功能升级</p>
</div>
<div style="padding: 20px;">
<p>Hi {{username}}，</p>
<p>我们很兴奋地宣布AIDESIGNTEE的重大更新！基于用户反馈，我们推出了多项令人激动的新功能：</p>

<div class="feature-card">
<h3>🎨 AI设计引擎升级</h3>
<p>全新的AI算法，生成质量提升30%，支持更多艺术风格和细节控制。</p>
</div>

<div class="feature-card">
<h3>👥 社区设计广场</h3>
<p>发现其他设计师的精彩作品，点赞、收藏、使用他们的设计模板。</p>
</div>

<div class="feature-card">
<h3>📱 移动端优化</h3>
<p>全新的移动端体验，随时随地在手机上设计和管理您的T恤。</p>
</div>

<div class="feature-card">
<h3>💰 设计师收益提升</h3>
<p>设计师分成比例从10%提升至15%，更多创作激励等您获取。</p>
</div>

<div style="text-align: center; margin: 30px 0;">
<a href="{{update_url}}" class="button">立即体验新功能</a>
</div>

<p>感谢您一直以来的支持，我们会继续努力为您带来更好的设计体验！</p>
</div>
</div>
</body></html>', 
'AIDESIGNTEE重大更新：AI引擎升级、社区广场、移动端优化、设计师收益提升！', true, 
'{"username": "用户名", "update_url": "更新页面链接"}');

-- 插入用户分群数据
INSERT INTO user_segments (name, description, conditions, is_dynamic, user_count) VALUES
('新注册用户', '注册7天内的新用户', '{"registered_days": {"lte": 7}}', true, 0),
('活跃用户', '最近30天内有登录的用户', '{"last_login_days": {"lte": 30}}', true, 0),
('沉睡用户', '超过30天未登录的用户', '{"last_login_days": {"gt": 30}}', true, 0),
('付费用户', '有过购买记录的用户', '{"has_orders": true}', true, 0),
('设计师用户', '有公开设计作品的用户', '{"has_public_designs": true}', true, 0),
('潜在付费用户', '有购物车但未下单的用户', '{"has_cart_items": true, "has_orders": false}', true, 0),
('高价值用户', '购买金额超过500元的用户', '{"total_spent": {"gte": 500}}', true, 0),
('VIP候选用户', '购买次数超过3次的用户', '{"order_count": {"gte": 3}}', true, 0);

-- 插入营销活动数据
INSERT INTO email_campaigns (name, description, template_id, segment_id, status, created_by) VALUES
('新用户欢迎系列', '针对新注册用户的欢迎邮件营销活动', 
 (SELECT id FROM email_templates WHERE name = '用户注册欢迎邮件'), 
 (SELECT id FROM user_segments WHERE name = '新注册用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1)),

('限时优惠推广', '新用户专享8折优惠券推广活动', 
 (SELECT id FROM email_templates WHERE name = '新用户限时优惠'), 
 (SELECT id FROM user_segments WHERE name = '新注册用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1)),

('购物车挽回', '购物车放弃用户的挽回营销活动', 
 (SELECT id FROM email_templates WHERE name = '购物车商品提醒'), 
 (SELECT id FROM user_segments WHERE name = '潜在付费用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1)),

('用户唤醒计划', '针对沉睡用户的重新激活活动', 
 (SELECT id FROM email_templates WHERE name = '想念您的邮件'), 
 (SELECT id FROM user_segments WHERE name = '沉睡用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1)),

('产品功能介绍', '向新用户介绍平台功能的教育营销', 
 (SELECT id FROM email_templates WHERE name = '产品功能介绍'), 
 (SELECT id FROM user_segments WHERE name = '新注册用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1)),

('新功能发布通知', '向所有活跃用户推送新功能更新', 
 (SELECT id FROM email_templates WHERE name = '新功能发布'), 
 (SELECT id FROM user_segments WHERE name = '活跃用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1)),

('订单确认通知', '用户下单后的自动确认邮件', 
 (SELECT id FROM email_templates WHERE name = '订单确认通知'), 
 (SELECT id FROM user_segments WHERE name = '付费用户'), 
 'draft', 
 (SELECT user_id FROM admin_users LIMIT 1));
