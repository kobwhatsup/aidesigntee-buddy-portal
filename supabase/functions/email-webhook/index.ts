
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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('收到邮件事件webhook:', payload);

    const { type, data } = payload;

    if (!data || !data.email_id) {
      console.error('Invalid webhook payload:', payload);
      return new Response('Invalid payload', { status: 400, headers: corsHeaders });
    }

    const trackingId = data.email_id;
    const eventType = type; // 事件类型: email.sent, email.delivered, email.opened, email.clicked, email.bounced, etc.

    // 更新邮件发送状态
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    switch (eventType) {
      case 'email.delivered':
        updateData.status = 'delivered';
        updateData.delivered_at = new Date().toISOString();
        break;
      
      case 'email.opened':
        updateData.opened_at = new Date().toISOString();
        updateData.open_count = supabase.raw('COALESCE(open_count, 0) + 1');
        break;
      
      case 'email.clicked':
        updateData.clicked_at = new Date().toISOString();
        updateData.click_count = supabase.raw('COALESCE(click_count, 0) + 1');
        if (data.link && data.link.url) {
          updateData.last_clicked_url = data.link.url;
        }
        break;
      
      case 'email.bounced':
        updateData.status = 'bounced';
        updateData.bounced_at = new Date().toISOString();
        if (data.reason) {
          updateData.error_message = data.reason;
        }
        break;
      
      case 'email.complained':
        updateData.status = 'complained';
        updateData.complained_at = new Date().toISOString();
        break;
      
      case 'email.unsubscribed':
        updateData.unsubscribed_at = new Date().toISOString();
        break;
      
      default:
        console.log('未处理的事件类型:', eventType);
        break;
    }

    // 更新发送记录
    const { error } = await supabase
      .from('email_sends')
      .update(updateData)
      .eq('tracking_id', trackingId);

    if (error) {
      console.error('更新邮件状态失败:', error);
      return new Response('Database update failed', { status: 500, headers: corsHeaders });
    }

    console.log(`邮件状态已更新: ${trackingId} -> ${eventType}`);

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook处理错误:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});
