
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserWithOrders {
  id: string;
  email: string | null;
  created_at: string;
  username: string | null;
  order_count: number;
}

Deno.serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('开始处理管理员用户数据请求...');
    
    // 使用服务角色密钥创建 Supabase 客户端
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 检查请求用户是否为管理员
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('缺少授权头');
      return new Response(
        JSON.stringify({ error: '未授权访问' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 验证用户身份
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.log('用户验证失败:', userError);
      return new Response(
        JSON.stringify({ error: '用户验证失败' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 检查管理员权限
    const { data: adminUser, error: adminError } = await supabaseServiceRole
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminUser) {
      console.log('管理员权限检查失败:', adminError);
      return new Response(
        JSON.stringify({ error: '没有管理员权限' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('管理员权限验证通过，开始获取用户数据...');

    // 使用服务角色获取所有用户数据
    const { data: authUsers, error: authError } = await supabaseServiceRole.auth.admin.listUsers();

    if (authError) {
      console.error('获取auth用户失败:', authError);
      return new Response(
        JSON.stringify({ error: '获取用户数据失败', details: authError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`成功获取 ${authUsers.users.length} 个用户的认证数据`);

    // 获取profiles数据
    const { data: profiles, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('id, username');

    if (profileError) {
      console.error('获取profiles失败:', profileError);
    }

    // 创建profiles映射
    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    // 批量获取所有用户的订单数量
    const userIds = authUsers.users.map(u => u.id);
    const orderCounts = new Map();

    if (userIds.length > 0) {
      const { data: orderCountData, error: orderError } = await supabaseServiceRole
        .from('orders')
        .select('user_id')
        .in('user_id', userIds);

      if (orderError) {
        console.error('获取订单数据失败:', orderError);
      } else if (orderCountData) {
        orderCountData.forEach(order => {
          const count = orderCounts.get(order.user_id) || 0;
          orderCounts.set(order.user_id, count + 1);
        });
      }
    }

    // 合并数据
    const usersWithOrders: UserWithOrders[] = authUsers.users.map(authUser => {
      const profile = profilesMap.get(authUser.id);
      return {
        id: authUser.id,
        email: authUser.email || null,
        created_at: authUser.created_at,
        username: profile?.username || null,
        order_count: orderCounts.get(authUser.id) || 0
      };
    });

    console.log(`成功处理 ${usersWithOrders.length} 个用户数据`);

    return new Response(
      JSON.stringify({ users: usersWithOrders }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误', 
        details: error instanceof Error ? error.message : '未知错误' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
