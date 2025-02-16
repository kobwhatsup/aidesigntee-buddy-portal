
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DesignPreview } from "./DesignPreview";

interface OrderItemProps {
  item: {
    tshirt_style: string;
    tshirt_color: string;
    tshirt_size: string;
    quantity: number;
    unit_price: number;
    design_front?: string;
    design_back?: string;
    preview_front?: string;
    preview_back?: string;
    front_design_settings?: any;
    back_design_settings?: any;
  };
}

export function OrderItem({ item }: OrderItemProps) {
  const { toast } = useToast();

  const downloadAllImages = async () => {
    const images = [
      { url: item.design_front, filename: '正面设计图.png' },
      { url: item.design_back, filename: '背面设计图.png' },
      { url: item.preview_front, filename: '正面预览图.png' },
      { url: item.preview_back, filename: '背面预览图.png' }
    ].filter(img => img.url); // 只下载存在的图片

    if (images.length === 0) {
      toast({
        title: "没有可下载的图片",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const image of images) {
        const response = await fetch(image.url!);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = image.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "下载成功",
        description: "所有图片已开始下载",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "下载失败",
        description: "图片下载过程中出现错误",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 商品基本信息 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">款式：</span>
                {item.tshirt_style}
              </div>
              <div>
                <span className="font-medium">颜色：</span>
                {item.tshirt_color}
              </div>
              <div>
                <span className="font-medium">尺码：</span>
                {item.tshirt_size}
              </div>
              <div>
                <span className="font-medium">数量：</span>
                {item.quantity}
              </div>
              <div>
                <span className="font-medium">单价：</span>
                ¥{item.unit_price}
              </div>
              <div>
                <span className="font-medium">小计：</span>
                ¥{item.quantity * item.unit_price}
              </div>
            </div>
            <Button
              onClick={downloadAllImages}
              className="h-10"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              一键下载图片
            </Button>
          </div>
          {item.front_design_settings && (
            <div>
              <span className="font-medium">正面设计位置：</span>
              <pre className="mt-2 p-2 bg-gray-50 rounded text-sm">
                {JSON.stringify(item.front_design_settings, null, 2)}
              </pre>
            </div>
          )}
          {item.back_design_settings && (
            <div>
              <span className="font-medium">背面设计位置：</span>
              <pre className="mt-2 p-2 bg-gray-50 rounded text-sm">
                {JSON.stringify(item.back_design_settings, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 设计图展示 */}
        <div className="space-y-4">
          <DesignPreview
            title="正面设计"
            designImage={item.design_front}
            previewImage={item.preview_front}
          />
          <DesignPreview
            title="背面设计"
            designImage={item.design_back}
            previewImage={item.preview_back}
          />
        </div>
      </div>
    </div>
  );
}
