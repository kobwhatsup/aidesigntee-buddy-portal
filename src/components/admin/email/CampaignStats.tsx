
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Eye, 
  MousePointer, 
  XCircle,
  BarChart3
} from "lucide-react";

interface CampaignStatsProps {
  campaignId: string;
}

export function CampaignStats({ campaignId }: CampaignStatsProps) {
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: sendStats } = useQuery({
    queryKey: ['campaign-send-stats', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sends')
        .select('status')
        .eq('campaign_id', campaignId);

      if (error) throw error;
      
      const stats = {
        pending: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0
      };

      data.forEach(record => {
        stats[record.status as keyof typeof stats]++;
      });

      return stats;
    },
    enabled: !!campaignId,
  });

  if (isLoading) {
    return <div className="flex justify-center p-4">加载中...</div>;
  }

  if (!campaign) {
    return <div className="text-center p-4 text-gray-500">未找到活动数据</div>;
  }

  const calculateRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return 0;
    return ((numerator / denominator) * 100).toFixed(1);
  };

  const totalSent = sendStats?.sent || 0;
  const deliveryRate = calculateRate(sendStats?.delivered || 0, totalSent);
  const openRate = calculateRate(sendStats?.opened || 0, totalSent);
  const clickRate = calculateRate(sendStats?.clicked || 0, totalSent);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            活动统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{campaign.total_recipients || 0}</div>
              <div className="text-sm text-gray-500">目标用户</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{sendStats?.sent || 0}</div>
              <div className="text-sm text-gray-500">已发送</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold">{sendStats?.delivered || 0}</div>
              <div className="text-sm text-gray-500">送达成功</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{sendStats?.opened || 0}</div>
              <div className="text-sm text-gray-500">邮件打开</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {totalSent > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>转化率统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">送达率</span>
                <Badge variant="secondary">{deliveryRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">打开率</span>
                <Badge variant="secondary">{openRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">点击率</span>
                <Badge variant="secondary">{clickRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sendStats && (
        <Card>
          <CardHeader>
            <CardTitle>发送状态详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">等待发送</span>
                <span>{sendStats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">发送成功</span>
                <span>{sendStats.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">送达成功</span>
                <span>{sendStats.delivered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">已打开</span>
                <span>{sendStats.opened}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">已点击</span>
                <span>{sendStats.clicked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">发送失败</span>
                <span className="text-red-600">{sendStats.failed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">退信</span>
                <span className="text-orange-600">{sendStats.bounced}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
