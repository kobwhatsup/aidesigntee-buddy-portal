
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Send, Mail } from "lucide-react";
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
    <>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">邮件模板</h2>
            <p className="text-sm text-gray-600 mt-1">管理您的邮件模板库</p>
          </div>
          <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            创建模板
          </Button>
        </div>

        {templates?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无邮件模板</h3>
              <p className="text-gray-600 mb-6 max-w-sm">创建您的第一个邮件模板，为营销活动做准备</p>
              <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                创建模板
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates?.map((template) => (
                <Card 
                  key={template.id} 
                  className="h-[280px] flex flex-col bg-white border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="flex-shrink-0 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-gray-900 line-clamp-2 leading-tight">
                          {template.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-700">
                          {getTemplateTypeLabel(template.template_type)}
                        </Badge>
                      </div>
                      <Badge 
                        variant={template.is_active ? "default" : "secondary"}
                        className="ml-2 flex-shrink-0"
                      >
                        {template.is_active ? "激活" : "停用"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-0">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {template.subject}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
                      <div className="text-xs text-gray-500">
                        创建时间: {format(new Date(template.created_at), 'yyyy-MM-dd HH:mm')}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestTemplate(template)}
                          className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          测试
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 border-gray-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
