
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Mail, Eye, MousePointer } from "lucide-react";

interface SendingProgressProps {
  campaignId: string;
}

export function SendingProgress({ campaignId }: SendingProgressProps) {
  const { data: campaign, refetch } = useQuery({
    queryKey: ['campaign-progress', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: (query) => query.state.data?.status === 'sending' ? 2000 : false,
  });

  const { data: sendStats } = useQuery({
    queryKey: ['send-stats', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sends')
        .select(`
          status,
          opened_at,
          clicked_at,
          delivered_at,
          bounced_at
        `)
        .eq('campaign_id', campaignId);

      if (error) throw error;

      const stats = {
        total: data.length,
        sent: data.filter(s => s.status === 'sent').length,
        delivered: data.filter(s => s.status === 'delivered' || s.delivered_at).length,
        opened: data.filter(s => s.opened_at).length,
        clicked: data.filter(s => s.clicked_at).length,
        bounced: data.filter(s => s.status === 'bounced').length,
        failed: data.filter(s => s.status === 'failed').length,
      };

      return stats;
    },
    enabled: !!campaignId,
    refetchInterval: campaign?.status === 'sending' ? 3000 : 30000,
  });

  if (!campaign) {
    return <div className="flex justify-center p-4">加载中...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'sending':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const progressPercentage = sendStats && campaign.total_recipients 
    ? (sendStats.sent / campaign.total_recipients) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(campaign.status)}
          发送进度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>发送进度</span>
            <span>{sendStats?.sent || 0} / {campaign.total_recipients || 0}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {sendStats && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>已发送: {sendStats.sent}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>已送达: {sendStats.delivered}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span>已打开: {sendStats.opened}</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-orange-500" />
              <span>已点击: {sendStats.clicked}</span>
            </div>
            {sendStats.bounced > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>被退回: {sendStats.bounced}</span>
              </div>
            )}
            {sendStats.failed > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>发送失败: {sendStats.failed}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">活动状态:</span>
            <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
              {campaign.status === 'draft' && '草稿'}
              {campaign.status === 'sending' && '发送中'}
              {campaign.status === 'sent' && '已完成'}
              {campaign.status === 'scheduled' && '已安排'}
              {campaign.status === 'paused' && '已暂停'}
              {campaign.status === 'cancelled' && '已取消'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
