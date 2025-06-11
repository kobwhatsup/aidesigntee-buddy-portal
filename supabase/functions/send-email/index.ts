
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    console.log('开始处理邮件发送请求', { campaignId, templateId, segmentId });

    // 1. 获取邮件模板
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('获取邮件模板失败: ' + templateError?.message);
    }

    // 2. 获取营销活动
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('获取营销活动失败: ' + campaignError?.message);
    }

    // 3. 更新活动状态为发送中
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending', sent_at: new Date().toISOString() })
      .eq('id', campaignId);

    // 4. 获取目标用户列表
    let targetUsers: any[] = [];
    
    if (segmentId) {
      // 根据分群获取用户
      const { data: segment, error: segmentError } = await supabase
        .from('user_segments')
        .select('*')
        .eq('id', segmentId)
        .single();
      
      if (segmentError || !segment) {
        throw new Error('获取用户分群失败: ' + segmentError?.message);
      }

      // 简化处理：获取所有有邮箱的用户
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .not('email', 'is', null);
      
      if (usersError) {
        console.error('获取用户列表失败:', usersError);
      }
      
      targetUsers = users || [];
    } else {
      // 如果没有指定分群，获取所有有邮箱的用户
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .not('email', 'is', null);
      
      if (usersError) {
        console.error('获取用户列表失败:', usersError);
      }
      
      targetUsers = users || [];
    }

    console.log(`找到 ${targetUsers.length} 个目标用户`);

    // 5. 更新活动的收件人数量
    await supabase
      .from('email_campaigns')
      .update({ total_recipients: targetUsers.length })
      .eq('id', campaignId);

    // 6. 批量发送邮件
    let successCount = 0;
    let errorCount = 0;
    const emailRecords = [];

    for (const user of targetUsers) {
      try {
        // 个性化邮件内容
        const personalizedContent = personalizeEmailContent(template.html_content, {
          username: user.username || '用户',
          user_id: user.id,
          website_url: 'https://aidesigntee.com',
          unsubscribe_url: `https://aidesigntee.com/unsubscribe?token=${user.id}`,
        });

        const personalizedSubject = personalizeEmailContent(template.subject, {
          username: user.username || '用户',
        });

        // 发送邮件
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: `${campaign.name} <noreply@aidesigntee.com>`,
          to: [user.email],
          subject: personalizedSubject,
          html: personalizedContent,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-User-ID': user.id,
          },
        });

        if (emailError) {
          throw emailError;
        }

        // 记录成功发送
        emailRecords.push({
          campaign_id: campaignId,
          user_id: user.id,
          email: user.email,
          status: 'sent',
          tracking_id: emailResult.id,
          sent_at: new Date().toISOString(),
        });

        successCount++;
        console.log(`邮件发送成功: ${user.email}`);

      } catch (error) {
        console.error(`邮件发送失败 ${user.email}:`, error);
        
        // 记录失败发送
        emailRecords.push({
          campaign_id: campaignId,
          user_id: user.id,
          email: user.email,
          status: 'failed',
          error_message: error.message,
          sent_at: new Date().toISOString(),
        });

        errorCount++;
      }
    }

    // 7. 批量保存发送记录
    if (emailRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('email_sends')
        .insert(emailRecords);

      if (insertError) {
        console.error('保存发送记录失败:', insertError);
      }
    }

    // 8. 更新活动状态和统计
    const finalStatus = errorCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partial');
    
    await supabase
      .from('email_campaigns')
      .update({ 
        status: finalStatus,
        sent_count: successCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    console.log(`邮件发送完成: 成功 ${successCount}, 失败 ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `邮件发送完成`,
        recipients: targetUsers.length,
        sent: successCount,
        failed: errorCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('邮件发送处理错误:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// 个性化邮件内容的辅助函数
function personalizeEmailContent(content: string, variables: Record<string, string>): string {
  let personalizedContent = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    personalizedContent = personalizedContent.replace(regex, value);
  });

  return personalizedContent;
}
