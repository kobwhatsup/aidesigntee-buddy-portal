
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AutomationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: any;
  onSave: () => void;
}

export function AutomationEditor({ isOpen, onClose, rule, onSave }: AutomationEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset } = useForm();

  const { data: templates } = useQuery({
    queryKey: ['email-templates-for-automation'],
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

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        description: rule.description,
        trigger_type: rule.trigger_type,
        template_id: rule.template_id,
        delay_minutes: rule.delay_minutes || 0,
        is_active: rule.is_active,
        trigger_conditions: rule.trigger_conditions || {},
      });
    } else {
      reset({
        name: '',
        description: '',
        trigger_type: '',
        template_id: '',
        delay_minutes: 0,
        is_active: true,
        trigger_conditions: {},
      });
    }
  }, [rule, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const ruleData = {
        ...data,
        created_by: user?.id,
      };

      if (rule) {
        const { error } = await supabase
          .from('email_automation_rules')
          .update(ruleData)
          .eq('id', rule.id);

        if (error) throw error;
        
        toast({
          title: "更新成功",
          description: "自动化规则已更新",
        });
      } else {
        const { error } = await supabase
          .from('email_automation_rules')
          .insert(ruleData);

        if (error) throw error;
        
        toast({
          title: "创建成功",
          description: "自动化规则已创建",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? '编辑自动化规则' : '创建自动化规则'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">规则名称</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="输入规则名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">规则描述</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="输入规则描述"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger_type">触发条件</Label>
            <Select
              value={watch('trigger_type')}
              onValueChange={(value) => setValue('trigger_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择触发条件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_signup">用户注册</SelectItem>
                <SelectItem value="order_completed">订单完成</SelectItem>
                <SelectItem value="order_shipped">订单发货</SelectItem>
                <SelectItem value="cart_abandoned">购物车遗弃</SelectItem>
                <SelectItem value="user_inactive">用户不活跃</SelectItem>
                <SelectItem value="birthday">生日提醒</SelectItem>
                <SelectItem value="subscription_expiry">订阅到期</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_id">邮件模板</Label>
            <Select
              value={watch('template_id')}
              onValueChange={(value) => setValue('template_id', value)}
            >
              <SelectTrigger>
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
            <Label htmlFor="delay_minutes">延迟时间（分钟）</Label>
            <Input
              id="delay_minutes"
              type="number"
              min="0"
              {...register('delay_minutes', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">启用规则</Label>
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : (rule ? '更新' : '创建')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
