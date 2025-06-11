
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { templateId, segmentId, campaignId } = await req.json();
    
    if (!templateId || !campaignId) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 获取邮件模板
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('获取邮件模板失败');
    }

    // 2. 获取营销活动
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('获取营销活动失败');
    }

    // 3. 更新活动状态为发送中
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // 4. 获取目标用户列表
    let targetUsers: any[] = [];
    
    if (segmentId) {
      const { data: segment, error: segmentError } = await supabase
        .from('user_segments')
        .select('*')
        .eq('id', segmentId)
        .single();
      
      if (segmentError || !segment) {
        throw new Error('获取用户分群失败');
      }

      // 这里简化处理，实际应该根据分群条件动态查询
      // 例如条件包含最近登录时间、是否有订单等
      // 为了演示，我们简单地获取所有用户
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username');
      
      targetUsers = users || [];
      
    } else {
      // 如果没有指定分群，则获取所有用户
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username');
      
      targetUsers = users || [];
    }

    // 5. 更新活动信息
    await supabase
      .from('email_campaigns')
      .update({ total_recipients: targetUsers.length })
      .eq('id', campaignId);

    // 6. 准备数据并创建发送记录
    // 注意：实际发送操作在此处简化，应该使用邮件服务供应商如 SendGrid, Mailgun, Amazon SES 等
    
    const emailRecords = targetUsers.map(user => ({
      campaign_id: campaignId,
      user_id: user.id,
      email: `${user.username || user.id}@example.com`, // 示例邮箱，实际应该从用户资料中获取
      status: 'pending',
      tracking_id: crypto.randomUUID(),
    }));

    if (emailRecords.length > 0) {
      await supabase
        .from('email_sends')
        .insert(emailRecords);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `已创建 ${emailRecords.length} 条发送记录`,
        recipients: targetUsers.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
