
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Heading1, 
  FileText,
  Palette,
  Settings
} from "lucide-react";
import { EmailElement } from "./VisualTemplateEditor";

interface EmailComponentsProps {
  onAddElement: (type: EmailElement['type']) => void;
}

export function EmailComponents({ onAddElement }: EmailComponentsProps) {
  const componentCategories = [
    {
      title: "基础组件",
      components: [
        {
          type: 'header' as const,
          label: '标题',
          icon: <Heading1 className="h-6 w-6" />,
          description: '大标题文本',
          preview: '<h1 style="font-size: 24px; font-weight: bold; margin: 0;">标题示例</h1>'
        },
        {
          type: 'text' as const,
          label: '文本',
          icon: <Type className="h-6 w-6" />,
          description: '段落文本',
          preview: '<p style="font-size: 16px; line-height: 1.5; margin: 0;">文本段落示例</p>'
        },
        {
          type: 'image' as const,
          label: '图片',
          icon: <Image className="h-6 w-6" />,
          description: '图片组件',
          preview: '<div style="width: 100%; height: 60px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">图片预览</div>'
        }
      ]
    },
    {
      title: "交互组件",
      components: [
        {
          type: 'button' as const,
          label: '按钮',
          icon: <Square className="h-6 w-6" />,
          description: '行动按钮',
          preview: '<a style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">按钮示例</a>'
        }
      ]
    },
    {
      title: "布局组件",
      components: [
        {
          type: 'divider' as const,
          label: '分割线',
          icon: <Minus className="h-6 w-6" />,
          description: '水平分割线',
          preview: '<hr style="border: none; height: 1px; background: #ddd; margin: 16px 0;" />'
        },
        {
          type: 'footer' as const,
          label: '页脚',
          icon: <FileText className="h-6 w-6" />,
          description: '页脚信息',
          preview: '<div style="font-size: 12px; color: #666; text-align: center;">页脚示例</div>'
        }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          组件库
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {componentCategories.map((category) => (
          <div key={category.title}>
            <h4 className="font-medium text-sm text-gray-700 mb-3">{category.title}</h4>
            <div className="space-y-3">
              {category.components.map((component) => (
                <div
                  key={component.type}
                  className="border rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => onAddElement(component.type)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-blue-600">{component.icon}</div>
                    <div>
                      <div className="font-medium text-sm">{component.label}</div>
                      <div className="text-xs text-gray-500">{component.description}</div>
                    </div>
                  </div>
                  <div 
                    className="bg-gray-50 p-2 rounded text-xs"
                    dangerouslySetInnerHTML={{ __html: component.preview }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm text-gray-700 mb-3">快速样式</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              主题色
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              字体
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
