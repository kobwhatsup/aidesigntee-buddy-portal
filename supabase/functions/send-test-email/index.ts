
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  templateId?: string;
  testEmail: string;
  subject: string;
  htmlContent: string;
  variables?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 获取当前用户
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { templateId, testEmail, subject, htmlContent, variables = {} }: TestEmailRequest = await req.json();

    // 创建测试发送记录
    const testSendRecord = {
      template_id: templateId || null,
      test_email: testEmail,
      subject,
      html_content: htmlContent,
      variables_used: variables,
      sent_by: user.id,
      status: 'pending'
    };

    const { data: testSend, error: insertError } = await supabaseClient
      .from('email_test_sends')
      .insert(testSendRecord)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating test send record:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create test send record" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 替换变量
    let processedHtml = htmlContent;
    let processedSubject = subject;

    // 使用提供的变量替换模板中的占位符
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedHtml = processedHtml.replace(regex, value);
      processedSubject = processedSubject.replace(regex, value);
    });

    console.log("Sending test email to:", testEmail);
    console.log("Subject:", processedSubject);

    // 发送邮件
    const emailResponse = await resend.emails.send({
      from: "Design Platform <onboarding@resend.dev>",
      to: [testEmail],
      subject: processedSubject,
      html: processedHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // 更新测试发送记录
    const updateData: any = {
      status: 'sent',
      sent_at: new Date().toISOString(),
    };

    if (emailResponse.data?.id) {
      updateData.tracking_id = emailResponse.data.id;
    }

    await supabaseClient
      .from('email_test_sends')
      .update(updateData)
      .eq('id', testSend.id);

    return new Response(JSON.stringify({ 
      success: true, 
      testSendId: testSend.id,
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-test-email function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send test email" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
