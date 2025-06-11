
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: () => void;
}

export function TemplateEditor({ isOpen, onClose, template, onSave }: TemplateEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset } = useForm();

  const templateTypes = [
    { value: 'welcome', label: '欢迎邮件' },
    { value: 'promotional', label: '营销推广' },
    { value: 'notification', label: '通知邮件' },
    { value: 'order_confirmation', label: '订单确认' },
    { value: 'order_shipped', label: '订单发货' },
    { value: 'newsletter', label: '邮件简报' },
    { value: 'abandoned_cart', label: '购物车提醒' },
    { value: 'user_activation', label: '用户激活' },
  ];

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        subject: template.subject,
        template_type: template.template_type,
        html_content: template.html_content,
        text_content: template.text_content,
        is_active: template.is_active,
      });
    } else {
      reset({
        name: '',
        subject: '',
        template_type: 'promotional',
        html_content: '',
        text_content: '',
        is_active: true,
      });
    }
  }, [template, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const templateData = {
        ...data,
        created_by: user?.id,
        variables: {},
      };

      if (template) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', template.id);

        if (error) throw error;
        
        toast({
          title: "更新成功",
          description: "邮件模板已更新",
        });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(templateData);

        if (error) throw error;
        
        toast({
          title: "创建成功",
          description: "邮件模板已创建",
        });
      }

      onSave();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? '编辑邮件模板' : '创建邮件模板'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">模板名称</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="输入模板名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_type">模板类型</Label>
              <Select
                value={watch('template_type')}
                onValueChange={(value) => setValue('template_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择模板类型" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">邮件主题</Label>
            <Input
              id="subject"
              {...register('subject', { required: true })}
              placeholder="输入邮件主题"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="html_content">HTML 内容</Label>
            <Textarea
              id="html_content"
              {...register('html_content', { required: true })}
              placeholder="输入邮件的HTML内容"
              rows={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text_content">纯文本内容（可选）</Label>
            <Textarea
              id="text_content"
              {...register('text_content')}
              placeholder="输入邮件的纯文本内容"
              rows={5}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">启用模板</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : (template ? '更新' : '创建')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
