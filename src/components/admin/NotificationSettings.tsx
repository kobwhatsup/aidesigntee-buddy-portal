
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, Volume2, VolumeX } from 'lucide-react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useToast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    desktop: true,
    sound: true,
    highValue: true,
    nightMode: false
  });
  
  const { 
    permission, 
    isListening, 
    requestPermission, 
    startListening, 
    stopListening 
  } = useOrderNotifications();
  
  const { toast } = useToast();

  useEffect(() => {
    if (permission.granted && settings.desktop) {
      startListening();
    }
  }, [permission.granted, settings.desktop]);

  const handleDesktopToggle = async (enabled: boolean) => {
    if (enabled && !permission.granted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    setSettings(prev => ({ ...prev, desktop: enabled }));
    
    if (enabled && permission.granted) {
      startListening();
    } else {
      stopListening();
    }
  };

  const testNotification = () => {
    if (!permission.granted) {
      toast({
        title: "请先开启通知权限",
        variant: "destructive"
      });
      return;
    }

    new Notification('测试通知', {
      body: '这是一条测试通知，用于验证通知功能是否正常工作。',
      icon: '/favicon.ico'
    });

    toast({
      title: "测试通知已发送",
      description: "请检查您是否收到了桌面通知"
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <CardTitle>订单通知设置</CardTitle>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          {isListening && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              监听中
            </Badge>
          )}
          {permission.granted && (
            <Badge variant="outline" className="text-blue-600">
              已授权
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">桌面通知</Label>
              <div className="text-sm text-muted-foreground">
                收到新订单时显示桌面通知
              </div>
            </div>
            <Switch
              checked={settings.desktop}
              onCheckedChange={handleDesktopToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">声音提醒</Label>
              <div className="text-sm text-muted-foreground">
                播放通知声音
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {settings.sound ? (
                <Volume2 className="h-4 w-4 text-blue-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, sound: checked }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">高价值订单优先</Label>
              <div className="text-sm text-muted-foreground">
                大额订单使用更显著的通知方式
              </div>
            </div>
            <Switch
              checked={settings.highValue}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, highValue: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">夜间免打扰</Label>
              <div className="text-sm text-muted-foreground">
                22:00-8:00 期间降低通知频率
              </div>
            </div>
            <Switch
              checked={settings.nightMode}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, nightMode: checked }))
              }
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={testNotification}
            disabled={!permission.granted}
          >
            <Settings className="h-4 w-4 mr-2" />
            测试通知
          </Button>
          
          {!permission.granted && (
            <Button onClick={requestPermission}>
              <Bell className="h-4 w-4 mr-2" />
              开启通知权限
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <div className="font-medium mb-1">通知功能说明：</div>
          <ul className="space-y-1">
            <li>• 需要开启浏览器通知权限才能接收桌面通知</li>
            <li>• 即使浏览器在后台运行也能收到通知</li>
            <li>• 点击通知可直接跳转到订单详情页面</li>
            <li>• 支持多种通知触发条件和过滤规则</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
