import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CampaignSender } from "./CampaignSender";
import { EmailPreview } from "./EmailPreview";
import { CampaignStats } from "./CampaignStats";
import { SendingProgress } from "./SendingProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CampaignEditorProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any;
  onSave: () => void;
}

export function CampaignEditor({ isOpen, onClose, campaign, onSave }: CampaignEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset } = useForm();

  const { data: templates } = useQuery({
    queryKey: ['email-templates-for-campaign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const { data: segments } = useQuery({
    queryKey: ['user-segments-for-campaign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_segments')
        .select('id, name');
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (campaign) {
      reset({
        name: campaign.name,
        description: campaign.description,
        template_id: campaign.template_id,
        segment_id: campaign.segment_id,
      });
    } else {
      reset({
        name: '',
        description: '',
        template_id: '',
        segment_id: '',
      });
    }
  }, [campaign, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const campaignData = {
        ...data,
        created_by: user?.id,
        status: 'draft',
      };

      if (campaign) {
        const { error } = await supabase
          .from('email_campaigns')
          .update(campaignData)
          .eq('id', campaign.id);

        if (error) throw error;
        
        toast({
          title: "更新成功",
          description: "营销活动已更新",
        });
      } else {
        const { error } = await supabase
          .from('email_campaigns')
          .insert(campaignData);

        if (error) throw error;
        
        toast({
          title: "创建成功",
          description: "营销活动已创建",
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplateId = watch('template_id');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {campaign ? '编辑营销活动' : '创建营销活动'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="basic" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 flex-shrink-0 mt-4">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="preview">邮件预览</TabsTrigger>
              <TabsTrigger value="send">发送设置</TabsTrigger>
              {campaign && <TabsTrigger value="stats">数据统计</TabsTrigger>}
              {campaign && ['sending', 'sent', 'partial'].includes(campaign.status) && (
                <TabsTrigger value="progress">发送进度</TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 mt-6 overflow-y-auto">
              <TabsContent value="basic" className="h-full m-0">
                <div className="h-full flex flex-col">
                  <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-6">
                    <div className="flex-1 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">活动名称</Label>
                        <Input
                          id="name"
                          {...register('name', { required: true })}
                          placeholder="输入活动名称"
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">活动描述</Label>
                        <Textarea
                          id="description"
                          {...register('description')}
                          placeholder="输入活动描述"
                          rows={3}
                          className="bg-white resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template_id">邮件模板</Label>
                        <Select
                          value={watch('template_id')}
                          onValueChange={(value) => setValue('template_id', value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="选择邮件模板" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="segment_id">目标用户群</Label>
                        <Select
                          value={watch('segment_id')}
                          onValueChange={(value) => setValue('segment_id', value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="选择用户分群" />
                          </SelectTrigger>
                          <SelectContent>
                            {segments?.map((segment) => (
                              <SelectItem key={segment.id} value={segment.id}>
                                {segment.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t flex-shrink-0">
                      <Button type="button" variant="outline" onClick={onClose}>
                        取消
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? '保存中...' : (campaign ? '更新' : '创建')}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0">
                <div className="h-full">
                  <EmailPreview 
                    templateId={selectedTemplateId} 
                    campaignName={watch('name') || '未命名活动'} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="send" className="h-full m-0">
                <div className="h-full">
                  {campaign ? (
                    <CampaignSender campaign={campaign} onCampaignUpdate={onSave} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p className="text-lg mb-2">请先保存活动基本信息</p>
                        <p className="text-sm">保存后即可配置发送设置</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {campaign && (
                <TabsContent value="stats" className="h-full m-0">
                  <div className="h-full">
                    <CampaignStats campaignId={campaign.id} />
                  </div>
                </TabsContent>
              )}

              {campaign && ['sending', 'sent', 'partial'].includes(campaign.status) && (
                <TabsContent value="progress" className="h-full m-0">
                  <div className="h-full">
                    <SendingProgress campaignId={campaign.id} />
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
