
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileTemplate, 
  Eye, 
  Download,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmailElement } from "./VisualTemplateEditor";
import { useToast } from "@/hooks/use-toast";

interface TemplatePresetsProps {
  onApplyTemplate: (elements: EmailElement[]) => void;
}

export function TemplatePresets({ onApplyTemplate }: TemplatePresetsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: presets, isLoading } = useQuery({
    queryKey: ['email-template-presets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_template_presets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const categories = [
    { value: 'welcome', label: '欢迎邮件' },
    { value: 'promotional', label: '营销推广' },
    { value: 'notification', label: '通知邮件' },
    { value: 'newsletter', label: '邮件简报' },
  ];

  const filteredPresets = presets?.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || preset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApplyTemplate = (preset: any) => {
    try {
      const templateData = preset.template_data;
      if (templateData?.elements) {
        onApplyTemplate(templateData.elements);
        toast({
          title: "模板已应用",
          description: `"${preset.name}" 模板已成功应用到编辑器中`,
        });
      }
    } catch (error) {
      toast({
        title: "应用失败",
        description: "模板数据格式错误",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div>加载模板中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTemplate className="h-5 w-5" />
          预设模板
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索和过滤 */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              全部
            </Button>
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 模板列表 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPresets?.map((preset) => (
            <div
              key={preset.id}
              className="border rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{preset.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {categories.find(c => c.value === preset.category)?.label || preset.category}
                </Badge>
              </div>
              
              {/* 模板预览 */}
              {preset.thumbnail_url && (
                <div className="mb-3">
                  <img 
                    src={preset.thumbnail_url} 
                    alt={preset.name}
                    className="w-full h-20 object-cover rounded border"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApplyTemplate(preset)}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  使用模板
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // 这里可以添加预览功能
                    console.log('预览模板:', preset);
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredPresets?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileTemplate className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>未找到匹配的模板</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
