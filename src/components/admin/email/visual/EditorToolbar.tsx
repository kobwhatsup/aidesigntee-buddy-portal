
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Heading1, 
  FileText,
  Monitor,
  Smartphone,
  Code,
  Eye
} from "lucide-react";
import { EmailElement } from "./VisualTemplateEditor";

interface EditorToolbarProps {
  onAddElement: (type: EmailElement['type']) => void;
  onPreviewModeChange: (mode: 'desktop' | 'mobile') => void;
  previewMode: 'desktop' | 'mobile';
  onGenerateHTML: () => string;
}

export function EditorToolbar({ 
  onAddElement, 
  onPreviewModeChange, 
  previewMode,
  onGenerateHTML 
}: EditorToolbarProps) {
  const elementTypes: Array<{
    type: EmailElement['type'];
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      type: 'header',
      label: '标题',
      icon: <Heading1 className="h-4 w-4" />,
      description: '添加邮件标题'
    },
    {
      type: 'text',
      label: '文本',
      icon: <Type className="h-4 w-4" />,
      description: '添加文本段落'
    },
    {
      type: 'image',
      label: '图片',
      icon: <Image className="h-4 w-4" />,
      description: '添加图片'
    },
    {
      type: 'button',
      label: '按钮',
      icon: <Square className="h-4 w-4" />,
      description: '添加行动按钮'
    },
    {
      type: 'divider',
      label: '分割线',
      icon: <Minus className="h-4 w-4" />,
      description: '添加分割线'
    },
    {
      type: 'footer',
      label: '页脚',
      icon: <FileText className="h-4 w-4" />,
      description: '添加页脚信息'
    }
  ];

  return (
    <div className="border-b p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">可视化邮件编辑器</h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPreviewModeChange('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            桌面端
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPreviewModeChange('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            移动端
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {elementTypes.map((elementType) => (
          <Button
            key={elementType.type}
            variant="outline"
            size="sm"
            onClick={() => onAddElement(elementType.type)}
            className="flex items-center gap-2"
            title={elementType.description}
          >
            {elementType.icon}
            {elementType.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
