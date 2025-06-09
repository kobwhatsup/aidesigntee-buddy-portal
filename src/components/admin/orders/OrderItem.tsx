
import { DesignPreview } from "./DesignPreview";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleBatchDownload = async () => {
    const downloads: Promise<void>[] = [];
    
    // 下载正面设计图
    if (item.design_front) {
      downloads.push(downloadImage(item.design_front, "正面设计图"));
    }
    
    // 下载背面设计图
    if (item.design_back) {
      downloads.push(downloadImage(item.design_back, "背面设计图"));
    }

    try {
      await Promise.all(downloads);
      toast({
        title: "批量下载成功",
        description: `已下载 ${downloads.length} 个设计文件`,
      });
    } catch (error: any) {
      toast({
        title: "批量下载失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadImage = async (imagePath: string, title: string): Promise<void> => {
    try {
      const response = await fetch(`https://gfraqpwyfxmpzdllsfoc.supabase.co/storage/v1/object/public/design-images/${imagePath}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`下载${title}失败`);
    }
  };

  const hasDesignImages = item.design_front || item.design_back;

  return (
    <div className="border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 商品基本信息 */}
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
          
          {/* 批量下载按钮 */}
          {hasDesignImages && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleBatchDownload}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                批量下载设计图
              </Button>
            </div>
          )}

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
          {(item.design_front || item.preview_front) && (
            <DesignPreview
              title="正面设计"
              designImage={item.design_front}
              previewImage={item.preview_front}
            />
          )}
          {(item.design_back || item.preview_back) && (
            <DesignPreview
              title="背面设计"
              designImage={item.design_back}
              previewImage={item.preview_back}
            />
          )}
        </div>
      </div>
    </div>
  );
}
