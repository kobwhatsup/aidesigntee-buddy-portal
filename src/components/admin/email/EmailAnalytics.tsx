
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Mail, Users, TrendingUp, Eye, MousePointer } from "lucide-react";

export function EmailAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['email-analytics'],
    queryFn: async () => {
      // 获取活动统计
      const { data: campaigns, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*');

      if (campaignsError) throw campaignsError;

      // 获取发送记录统计
      const { data: sends, error: sendsError } = await supabase
        .from('email_sends')
        .select('*');

      if (sendsError) throw sendsError;

      // 计算统计数据
      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'sent').length || 0;
      const totalSent = sends?.length || 0;
      const totalDelivered = sends?.filter(s => s.status === 'delivered').length || 0;
      const totalOpened = sends?.filter(s => s.opened_at).length || 0;
      const totalClicked = sends?.filter(s => s.clicked_at).length || 0;

      return {
        totalCampaigns,
        activeCampaigns,
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0',
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0',
      };
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  const stats = [
    {
      title: "总活动数",
      value: analytics?.totalCampaigns || 0,
      icon: BarChart3,
      description: "已创建的邮件活动",
    },
    {
      title: "已发送邮件",
      value: analytics?.totalSent || 0,
      icon: Mail,
      description: "总发送邮件数量",
    },
    {
      title: "送达率",
      value: `${analytics?.deliveryRate || 0}%`,
      icon: TrendingUp,
      description: "邮件成功送达率",
    },
    {
      title: "打开率",
      value: `${analytics?.openRate || 0}%`,
      icon: Eye,
      description: "邮件打开率",
    },
    {
      title: "点击率",
      value: `${analytics?.clickRate || 0}%`,
      icon: MousePointer,
      description: "邮件点击率",
    },
    {
      title: "活跃活动",
      value: analytics?.activeCampaigns || 0,
      icon: Users,
      description: "正在运行的活动",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">数据分析</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近活动表现</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>详细的活动表现图表功能即将推出</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
