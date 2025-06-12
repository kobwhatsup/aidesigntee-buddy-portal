
import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorToolbar } from "./EditorToolbar";
import { EmailComponents } from "./EmailComponents";
import { EmailPreviewPanel } from "./EmailPreviewPanel";
import { VariableManager } from "./VariableManager";
import { Eye, Code, Smartphone, Monitor } from "lucide-react";

export interface EmailElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'header' | 'footer';
  content: string;
  styles: Record<string, any>;
  order: number;
}

interface VisualTemplateEditorProps {
  initialContent?: string;
  onContentChange: (html: string) => void;
  variables?: Record<string, string>;
}

export function VisualTemplateEditor({ 
  initialContent = "", 
  onContentChange,
  variables = {}
}: VisualTemplateEditorProps) {
  const [elements, setElements] = useState<EmailElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('visual');

  // 从初始HTML内容解析元素
  const parseInitialContent = useCallback(() => {
    if (initialContent && elements.length === 0) {
      // 简单的HTML解析逻辑，将现有HTML转换为可编辑元素
      const parser = new DOMParser();
      const doc = parser.parseFromString(initialContent, 'text/html');
      const body = doc.body;
      
      const parsedElements: EmailElement[] = [];
      let order = 0;
      
      body.childNodes.forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          parsedElements.push({
            id: `element-${index}`,
            type: element.tagName.toLowerCase() === 'img' ? 'image' : 'text',
            content: element.innerHTML || element.textContent || '',
            styles: {},
            order: order++
          });
        }
      });
      
      setElements(parsedElements);
    }
  }, [initialContent, elements.length]);

  // 添加新元素
  const addElement = useCallback((type: EmailElement['type']) => {
    const newElement: EmailElement = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      order: elements.length
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, [elements.length]);

  // 更新元素
  const updateElement = useCallback((id: string, updates: Partial<EmailElement>) => {
    setElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  }, []);

  // 删除元素
  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // 移动元素顺序
  const moveElement = useCallback((dragIndex: number, hoverIndex: number) => {
    setElements(prev => {
      const dragElement = prev[dragIndex];
      const newElements = [...prev];
      newElements.splice(dragIndex, 1);
      newElements.splice(hoverIndex, 0, dragElement);
      
      return newElements.map((el, index) => ({ ...el, order: index }));
    });
  }, []);

  // 生成HTML内容
  const generateHTML = useCallback(() => {
    const sortedElements = [...elements].sort((a, b) => a.order - b.order);
    const html = sortedElements.map(element => {
      return elementToHTML(element);
    }).join('\n');
    
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
            <tr>
              <td>
                ${html}
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    
    onContentChange(fullHTML);
    return fullHTML;
  }, [elements, onContentChange]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <EditorToolbar
          onAddElement={addElement}
          onPreviewModeChange={setPreviewMode}
          previewMode={previewMode}
          onGenerateHTML={generateHTML}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              可视化编辑
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              {previewMode === 'desktop' ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              预览
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              代码
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="flex-1 flex gap-4">
            <div className="w-80 space-y-4">
              <EmailComponents onAddElement={addElement} />
              <VariableManager variables={variables} />
            </div>
            
            <div className="flex-1">
              <EmailPreviewPanel
                elements={elements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
                onMoveElement={moveElement}
                previewMode={previewMode}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1">
            <Card className="h-full">
              <CardContent className="p-4">
                <div 
                  className={`mx-auto bg-white shadow-lg ${
                    previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
                  }`}
                  dangerouslySetInnerHTML={{ __html: generateHTML() }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="flex-1">
            <Card className="h-full">
              <CardContent className="p-4">
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto h-full">
                  <code>{generateHTML()}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  );
}

// 工具函数
function getDefaultContent(type: EmailElement['type']): string {
  switch (type) {
    case 'text':
      return '在此输入文本内容...';
    case 'image':
      return 'https://via.placeholder.com/600x200';
    case 'button':
      return '点击按钮';
    case 'divider':
      return '';
    case 'header':
      return '邮件标题';
    case 'footer':
      return '版权信息 © 2024';
    default:
      return '';
  }
}

function getDefaultStyles(type: EmailElement['type']): Record<string, any> {
  const baseStyles = {
    padding: '16px',
    margin: '0',
  };

  switch (type) {
    case 'text':
      return {
        ...baseStyles,
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333333',
      };
    case 'image':
      return {
        ...baseStyles,
        width: '100%',
        height: 'auto',
      };
    case 'button':
      return {
        ...baseStyles,
        backgroundColor: '#007bff',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '4px',
        textDecoration: 'none',
        display: 'inline-block',
      };
    case 'header':
      return {
        ...baseStyles,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
      };
    case 'footer':
      return {
        ...baseStyles,
        fontSize: '12px',
        color: '#666666',
        textAlign: 'center',
      };
    default:
      return baseStyles;
  }
}

function elementToHTML(element: EmailElement): string {
  const styles = Object.entries(element.styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');

  switch (element.type) {
    case 'text':
      return `<p style="${styles}">${element.content}</p>`;
    case 'image':
      return `<img src="${element.content}" style="${styles}" alt="Email Image" />`;
    case 'button':
      return `<a href="#" style="${styles}">${element.content}</a>`;
    case 'divider':
      return `<hr style="${styles}" />`;
    case 'header':
      return `<h1 style="${styles}">${element.content}</h1>`;
    case 'footer':
      return `<div style="${styles}">${element.content}</div>`;
    default:
      return `<div style="${styles}">${element.content}</div>`;
  }
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
