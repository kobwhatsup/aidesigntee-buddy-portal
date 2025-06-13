
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Mail, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailPreviewProps {
  templateId: string;
  campaignName: string;
}

export function EmailPreview({ templateId, campaignName }: EmailPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: template, isLoading } = useQuery({
    queryKey: ['email-template-preview', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!templateId && isOpen,
  });

  // 替换邮件模板中的变量为示例值
  const renderPreview = (content: string) => {
    const sampleData = {
      username: "张先生",
      website_url: "https://aidesigntee.com",
      design_url: "https://aidesigntee.com/design",
      shop_url: "https://aidesigntee.com/shop",
      product_name: "经典款T恤",
      design_title: "创意图案设计",
      size: "L",
      color: "白色",
      price: "99",
      cart_url: "https://aidesigntee.com/cart",
      dashboard_url: "https://aidesignt ee.com/dashboard",
      order_number: "T202412110001",
      quantity: "1",
      total_amount: "99",
      shipping_address: "北京市朝阳区xxx街道xxx号",
      update_url: "https://aidesigntee.com/updates"
    };

    let previewContent = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewContent = previewContent.replace(regex, value);
    });

    return previewContent;
  };

  if (!templateId) {
    return (
      <Card className="h-full flex flex-col bg-white border border-gray-200">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Eye className="h-5 w-5" />
            邮件预览
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">请先选择邮件模板</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-white border border-gray-200">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Eye className="h-5 w-5" />
          邮件预览
        </CardTitle>
        <p className="text-sm text-gray-600">预览邮件在收件人端的显示效果</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-12 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              预览邮件效果
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4 border-b">
              <DialogTitle className="text-xl">
                邮件预览 - {campaignName}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                </div>
              ) : template ? (
                <Tabs defaultValue="preview" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      预览效果
                    </TabsTrigger>
                    <TabsTrigger value="source" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      源代码
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 mt-4 overflow-hidden">
                    <TabsContent value="preview" className="h-full m-0">
                      <div className="h-full flex flex-col space-y-4">
                        <div className="flex-shrink-0">
                          <h4 className="font-medium mb-2 text-gray-900">邮件主题：</h4>
                          <div className="p-3 bg-gray-50 rounded border text-gray-900">
                            {renderPreview(template.subject)}
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-medium mb-2 text-gray-900">邮件内容：</h4>
                          <div className="h-full border rounded-lg overflow-auto">
                            <div 
                              className="p-4 bg-white h-full"
                              dangerouslySetInnerHTML={{ 
                                __html: renderPreview(template.html_content) 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="source" className="h-full m-0">
                      <div className="h-full">
                        <pre className="h-full p-4 bg-gray-50 rounded border text-sm overflow-auto text-gray-900">
                          {template.html_content}
                        </pre>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">模板加载失败</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
