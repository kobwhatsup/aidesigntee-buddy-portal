
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { VisualTemplateEditor } from "./visual/VisualTemplateEditor";
import { Eye, Code, Palette } from "lucide-react";

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: () => void;
}

export function TemplateEditor({ isOpen, onClose, template, onSave }: TemplateEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
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

  // 预定义变量
  const templateVariables = {
    username: "用户名",
    email: "邮箱地址", 
    website_url: "网站首页",
    design_url: "设计页面",
    shop_url: "商店页面",
    product_name: "产品名称",
    design_title: "设计标题",
    size: "尺寸",
    color: "颜色",
    price: "价格",
    cart_url: "购物车链接",
    dashboard_url: "用户面板",
    order_number: "订单号",
    quantity: "数量",
    total_amount: "订单总额",
    shipping_address: "收货地址",
    update_url: "更新链接"
  };

  useEffect(() => {
    if (template) {
      const formData = {
        name: template.name,
        subject: template.subject,
        template_type: template.template_type,
        html_content: template.html_content,
        text_content: template.text_content,
        is_active: template.is_active,
      };
      reset(formData);
      setHtmlContent(template.html_content || '');
    } else {
      const defaultData = {
        name: '',
        subject: '',
        template_type: 'promotional',
        html_content: '',
        text_content: '',
        is_active: true,
      };
      reset(defaultData);
      setHtmlContent('');
    }
  }, [template, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const templateData = {
        ...data,
        html_content: htmlContent,
        created_by: user?.id,
        variables: templateVariables,
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template ? '编辑邮件模板' : '创建邮件模板'}</span>
            <div className="flex items-center gap-2">
              <Button
                variant={editorMode === 'visual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('visual')}
              >
                <Palette className="h-4 w-4 mr-1" />
                可视化
              </Button>
              <Button
                variant={editorMode === 'code' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('code')}
              >
                <Code className="h-4 w-4 mr-1" />
                代码
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基础信息 */}
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
              placeholder="输入邮件主题，支持变量如 {{username}}"
            />
          </div>

          {/* 内容编辑区域 */}
          <div className="space-y-2">
            <Label>邮件内容</Label>
            <div className="border rounded-lg" style={{ height: '600px' }}>
              {editorMode === 'visual' ? (
                <VisualTemplateEditor
                  initialContent={htmlContent}
                  onContentChange={setHtmlContent}
                  variables={templateVariables}
                />
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="输入邮件的HTML内容，支持变量如 {{username}}"
                      className="h-full resize-none border-0 rounded-t-lg"
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                  <div className="border-t p-2 bg-gray-50 rounded-b-lg">
                    <p className="text-xs text-gray-600">
                      💡 支持HTML标签和变量，如：{`{{username}}, {{product_name}}, {{website_url}}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text_content">纯文本内容（可选）</Label>
            <Textarea
              id="text_content"
              {...register('text_content')}
              placeholder="输入邮件的纯文本内容，支持变量如 {{username}}"
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
