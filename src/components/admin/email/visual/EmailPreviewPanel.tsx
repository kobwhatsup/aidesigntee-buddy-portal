
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Edit, 
  Trash2, 
  GripVertical, 
  Palette,
  Type,
  Settings
} from "lucide-react";
import { EmailElement } from "./VisualTemplateEditor";

interface EmailPreviewPanelProps {
  elements: EmailElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<EmailElement>) => void;
  onDeleteElement: (id: string) => void;
  onMoveElement: (dragIndex: number, hoverIndex: number) => void;
  previewMode: 'desktop' | 'mobile';
}

export function EmailPreviewPanel({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onMoveElement,
  previewMode
}: EmailPreviewPanelProps) {
  return (
    <div className="flex gap-4 h-full">
      {/* 预览区域 */}
      <div className="flex-1">
        <Card className="h-full">
          <CardContent className="p-4">
            <div 
              className={`mx-auto bg-white border rounded-lg shadow-sm min-h-96 ${
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              }`}
            >
              {elements.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Type className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>从左侧组件库拖拽组件到这里开始编辑</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {elements
                    .sort((a, b) => a.order - b.order)
                    .map((element, index) => (
                      <DraggableElement
                        key={element.id}
                        element={element}
                        index={index}
                        isSelected={selectedElement === element.id}
                        onSelect={() => onSelectElement(element.id)}
                        onMove={onMoveElement}
                        onDelete={() => onDeleteElement(element.id)}
                      />
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 属性编辑面板 */}
      {selectedElement && (
        <div className="w-80">
          <ElementEditor
            element={elements.find(el => el.id === selectedElement)!}
            onUpdate={(updates) => onUpdateElement(selectedElement, updates)}
          />
        </div>
      )}
    </div>
  );
}

// 可拖拽元素组件
interface DraggableElementProps {
  element: EmailElement;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
}

function DraggableElement({
  element,
  index,
  isSelected,
  onSelect,
  onMove,
  onDelete
}: DraggableElementProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'email-element',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'email-element',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  const renderElement = () => {
    const styles = Object.entries(element.styles)
      .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
      .join('; ');

    switch (element.type) {
      case 'text':
        return <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: element.content }} />;
      case 'image':
        return <img src={element.content} alt="Email" style={{ maxWidth: '100%', height: 'auto' }} />;
      case 'button':
        return (
          <a 
            href="#" 
            style={{
              backgroundColor: '#007bff',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block',
              ...element.styles
            }}
          >
            {element.content}
          </a>
        );
      case 'divider':
        return <hr style={{ border: 'none', height: '1px', backgroundColor: '#ddd', margin: '16px 0' }} />;
      case 'header':
        return <h1 style={{ margin: 0, ...element.styles }}>{element.content}</h1>;
      case 'footer':
        return <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', ...element.styles }}>{element.content}</div>;
      default:
        return <div>{element.content}</div>;
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`group relative border-2 rounded transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="p-2">
        {renderElement()}
      </div>
      
      {/* 操作工具栏 */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onSelect}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// 元素编辑器
interface ElementEditorProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
}

function ElementEditor({ element, onUpdate }: ElementEditorProps) {
  const [content, setContent] = useState(element.content);
  const [styles, setStyles] = useState(element.styles);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onUpdate({ content: newContent });
  };

  const handleStyleChange = (property: string, value: string) => {
    const newStyles = { ...styles, [property]: value };
    setStyles(newStyles);
    onUpdate({ styles: newStyles });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Settings className="h-4 w-4" />
          编辑 {getElementTypeLabel(element.type)}
        </div>

        {/* 内容编辑 */}
        <div className="space-y-2">
          <Label>内容</Label>
          {element.type === 'text' || element.type === 'header' || element.type === 'footer' ? (
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="输入文本内容"
              rows={3}
            />
          ) : element.type === 'image' ? (
            <Input
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="图片URL"
            />
          ) : element.type === 'button' ? (
            <Input
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="按钮文字"
            />
          ) : null}
        </div>

        {/* 样式编辑 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette className="h-4 w-4" />
            样式设置
          </div>

          {/* 通用样式 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">字体大小</Label>
              <Input
                type="text"
                value={styles.fontSize || ''}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                placeholder="16px"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">颜色</Label>
              <Input
                type="color"
                value={styles.color || '#333333'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">内边距</Label>
              <Input
                type="text"
                value={styles.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="16px"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">外边距</Label>
              <Input
                type="text"
                value={styles.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="8px"
                className="text-xs"
              />
            </div>
          </div>

          {/* 特定类型样式 */}
          {element.type === 'button' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">背景色</Label>
                <Input
                  type="color"
                  value={styles.backgroundColor || '#007bff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">圆角</Label>
                <Input
                  type="text"
                  value={styles.borderRadius || ''}
                  onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                  placeholder="4px"
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {(element.type === 'text' || element.type === 'header' || element.type === 'footer') && (
            <div>
              <Label className="text-xs">文本对齐</Label>
              <select
                value={styles.textAlign || 'left'}
                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                className="w-full text-xs border rounded px-2 py-1"
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
              </select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 工具函数
function getElementTypeLabel(type: EmailElement['type']): string {
  const labels = {
    text: '文本',
    image: '图片',
    button: '按钮',
    divider: '分割线',
    header: '标题',
    footer: '页脚'
  };
  return labels[type] || type;
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
