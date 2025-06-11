
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CampaignSenderProps {
  campaign: any;
  onCampaignUpdate: () => void;
}

export function CampaignSender({ campaign, onCampaignUpdate }: CampaignSenderProps) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendCampaign = async () => {
    if (!campaign.template_id) {
      toast({
        title: "发送失败",
        description: "请先选择邮件模板",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // 调用邮件发送函数
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateId: campaign.template_id,
          segmentId: campaign.segment_id,
          campaignId: campaign.id,
        }
      });

      if (error) throw error;

      toast({
        title: "发送成功",
        description: `已创建 ${data.recipients} 条发送记录，邮件正在陆续发送中`,
      });

      onCampaignUpdate();
    } catch (error: any) {
      console.error('发送邮件失败:', error);
      toast({
        title: "发送失败",
        description: error.message || "发送邮件时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const canSend = campaign.status === 'draft' && campaign.template_id && campaign.segment_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          发送营销邮件
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">活动状态：</span>
            <Badge variant={campaign.status === 'draft' ? 'secondary' : 'default'} className="ml-2">
              {campaign.status === 'draft' ? '草稿' : campaign.status}
            </Badge>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-500">预计收件人：</span>
            <span className="ml-1 font-medium">{campaign.total_recipients || 0}</span>
          </div>
        </div>

        {!campaign.template_id && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">请先选择邮件模板</span>
          </div>
        )}

        {!campaign.segment_id && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">请先选择目标用户群</span>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!canSend || isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? '发送中...' : '发送邮件'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认发送邮件</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要发送营销活动"{campaign.name}"吗？
                <br />
                预计将向 {campaign.total_recipients || 0} 位用户发送邮件。
                <br />
                <strong>注意：发送后无法撤回</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendCampaign}>
                确认发送
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
