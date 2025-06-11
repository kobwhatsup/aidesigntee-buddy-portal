
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, BarChart3, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CampaignEditor } from "./CampaignEditor";

export function EmailCampaigns() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const { toast } = useToast();

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          email_templates(name),
          user_segments(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setIsEditorOpen(true);
  };

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsEditorOpen(true);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': '草稿',
      'scheduled': '已计划',
      'sending': '发送中',
      'sent': '已发送',
      'paused': '已暂停',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'secondary',
      'scheduled': 'default',
      'sending': 'default',
      'sent': 'default',
      'paused': 'secondary',
      'cancelled': 'destructive'
    };
    return colorMap[status] || 'secondary';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">营销活动</h2>
        <Button onClick={handleCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          创建活动
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge variant={getStatusColor(campaign.status) as any}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>
              {campaign.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {campaign.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">模板:</span>
                  <span>{campaign.email_templates?.name || '未选择'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">分群:</span>
                  <span>{campaign.user_segments?.name || '未选择'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">收件人:</span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {campaign.total_recipients || 0}
                  </span>
                </div>
                {campaign.sent_count > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">已发送:</span>
                    <span className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {campaign.sent_count}
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  创建时间: {format(new Date(campaign.created_at), 'yyyy-MM-dd HH:mm')}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleEditCampaign(campaign)}
                >
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无营销活动</h3>
          <p className="text-gray-600 mb-4">创建您的第一个邮件营销活动</p>
          <Button onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            创建活动
          </Button>
        </div>
      )}

      <CampaignEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        campaign={selectedCampaign}
        onSave={refetch}
      />
    </div>
  );
}
