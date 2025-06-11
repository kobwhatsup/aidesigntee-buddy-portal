
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      dashboard_url: "https://aidesigntee.com/dashboard",
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            邮件预览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">请先选择邮件模板</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          邮件预览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              预览邮件效果
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>邮件预览 - {campaignName}</DialogTitle>
            </DialogHeader>
            
            {isLoading ? (
              <div className="flex justify-center p-8">加载中...</div>
            ) : template ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">邮件主题：</h4>
                  <p className="p-3 bg-gray-50 rounded border">{template.subject}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">邮件内容：</h4>
                  <div 
                    className="border rounded-lg p-4 bg-white"
                    dangerouslySetInnerHTML={{ 
                      __html: renderPreview(template.html_content) 
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">模板加载失败</p>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
