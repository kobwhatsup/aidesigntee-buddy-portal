
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
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">营销活动</h2>
          <p className="text-sm text-gray-600 mt-1">管理您的邮件营销活动</p>
        </div>
        <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          创建活动
        </Button>
      </div>

      {campaigns?.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无营销活动</h3>
            <p className="text-gray-600 mb-6 max-w-sm">创建您的第一个邮件营销活动，开始与用户建立联系</p>
            <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              创建活动
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => (
              <Card 
                key={campaign.id} 
                className="h-[280px] flex flex-col cursor-pointer hover:shadow-md transition-all duration-200 bg-white border border-gray-200"
                onClick={() => handleEditCampaign(campaign)}
              >
                <CardHeader className="flex-shrink-0 pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-900 line-clamp-2 leading-tight">
                      {campaign.name}
                    </CardTitle>
                    <Badge variant={getStatusColor(campaign.status) as any} className="ml-2 flex-shrink-0">
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {campaign.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">模板:</span>
                      <span className="text-gray-900 truncate ml-2 max-w-[120px]">
                        {campaign.email_templates?.name || '未选择'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">分群:</span>
                      <span className="text-gray-900 truncate ml-2 max-w-[120px]">
                        {campaign.user_segments?.name || '未选择'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">收件人:</span>
                      <span className="flex items-center text-gray-900">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {campaign.total_recipients || 0}
                      </span>
                    </div>
                    {campaign.sent_count > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">已发送:</span>
                        <span className="flex items-center text-gray-900">
                          <BarChart3 className="h-4 w-4 mr-1 text-gray-400" />
                          {campaign.sent_count}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
                    <div className="text-xs text-gray-500">
                      创建时间: {format(new Date(campaign.created_at), 'yyyy-MM-dd HH:mm')}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCampaign(campaign);
                      }}
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
