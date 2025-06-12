import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Send } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TemplateEditor } from "./TemplateEditor";
import { EmailTestSender } from "./EmailTestSender";

export function EmailTemplates() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isTestSenderOpen, setIsTestSenderOpen] = useState(false);
  const [testTemplate, setTestTemplate] = useState<any>(null);
  const { toast } = useToast();

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "删除成功",
        description: "邮件模板已删除",
      });
      refetch();
    }
  };

  const handleTestTemplate = (template: any) => {
    setTestTemplate(template);
    setIsTestSenderOpen(true);
  };

  const getTemplateTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'welcome': '欢迎邮件',
      'promotional': '营销推广',
      'notification': '通知邮件',
      'order_confirmation': '订单确认',
      'order_shipped': '订单发货',
      'newsletter': '邮件简报',
      'abandoned_cart': '购物车提醒',
      'user_activation': '用户激活'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">邮件模板</h2>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            创建模板
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {getTemplateTypeLabel(template.template_type)}
                    </Badge>
                  </div>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "激活" : "停用"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.subject}
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  创建时间: {format(new Date(template.created_at), 'yyyy-MM-dd HH:mm')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestTemplate(template)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无邮件模板</h3>
            <p className="text-gray-600 mb-4">创建您的第一个邮件模板</p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              创建模板
            </Button>
          </div>
        )}
      </div>

      <TemplateEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        template={selectedTemplate}
        onSave={refetch}
      />

      {testTemplate && (
        <EmailTestSender
          isOpen={isTestSenderOpen}
          onClose={() => setIsTestSenderOpen(false)}
          templateId={testTemplate.id}
          subject={testTemplate.subject}
          htmlContent={testTemplate.html_content}
          variables={testTemplate.variables || {}}
        />
      )}
    </>
  );
}
