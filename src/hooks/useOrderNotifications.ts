
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermission {
  granted: boolean;
  loading: boolean;
}

interface OrderNotification {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export function useOrderNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    loading: true
  });
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // 检查通知权限
  useEffect(() => {
    const checkPermission = async () => {
      if (!('Notification' in window)) {
        console.log('此浏览器不支持桌面通知');
        setPermission({ granted: false, loading: false });
        return;
      }

      const currentPermission = Notification.permission;
      setPermission({ 
        granted: currentPermission === 'granted', 
        loading: false 
      });
    };

    checkPermission();
  }, []);

  // 请求通知权限
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "不支持通知",
        description: "您的浏览器不支持桌面通知功能",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermission({ granted, loading: false });
      
      if (granted) {
        toast({
          title: "通知权限已开启",
          description: "您将收到新订单的桌面通知"
        });
      } else {
        toast({
          title: "通知权限被拒绝",
          description: "请在浏览器设置中手动开启通知权限",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  };

  // 发送桌面通知
  const sendDesktopNotification = (order: OrderNotification) => {
    if (!permission.granted) return;

    const notification = new Notification('新订单通知！', {
      body: `订单号: ${order.order_number}\n金额: ¥${order.total_amount}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `order-${order.id}`,
      requireInteraction: true
    });

    // 点击通知跳转到订单详情
    notification.onclick = () => {
      window.focus();
      window.location.href = `/admin/orders/${order.id}`;
      notification.close();
    };

    // 5秒后自动关闭
    setTimeout(() => {
      notification.close();
    }, 5000);
  };

  // 开始监听订单变化
  const startListening = async () => {
    if (isListening) return;

    // 检查管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminUser) return;

    setIsListening(true);

    // 监听订单状态变化
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.paid'
        },
        (payload) => {
          console.log('订单状态变化:', payload);
          const order = payload.new as OrderNotification;
          
          // 发送桌面通知
          sendDesktopNotification(order);
          
          // 发送Toast通知
          toast({
            title: "新订单！",
            description: `订单 ${order.order_number} 已付款，金额 ¥${order.total_amount}`,
            duration: 8000
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('新订单创建:', payload);
          const order = payload.new as OrderNotification;
          
          toast({
            title: "新订单创建",
            description: `订单 ${order.order_number} 已创建`,
            duration: 5000
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      setIsListening(false);
    };
  };

  // 停止监听
  const stopListening = () => {
    setIsListening(false);
  };

  return {
    permission,
    isListening,
    requestPermission,
    startListening,
    stopListening
  };
}
