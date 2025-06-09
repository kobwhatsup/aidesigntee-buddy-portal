
import { DesignPreview } from "./DesignPreview";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const [isDownloading, setIsDownloading] = useState(false);

  // 判断是否为完整URL
  const isFullUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // 获取图片URL的函数
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // 如果已经是完整URL，直接返回
    if (isFullUrl(imagePath)) {
      console.log('Image path is already a full URL:', imagePath);
      return imagePath;
    }
    
    // 如果是相对路径，构建完整的Supabase Storage URL
    const fullUrl = `https://gfraqpwyfxmpzdllsfoc.supabase.co/storage/v1/object/public/design-images/${imagePath}`;
    console.log('Generated full URL from path:', imagePath, '->', fullUrl);
    return fullUrl;
  };

  const handleBatchDownload = async () => {
    setIsDownloading(true);
    const downloads: Promise<void>[] = [];
    let downloadCount = 0;
    
    try {
      // 下载正面设计图
      if (item.design_front) {
        const url = getImageUrl(item.design_front);
        console.log('Adding front design to batch download:', url);
        downloads.push(downloadImage(url, "正面设计图"));
        downloadCount++;
      }
      
      // 下载背面设计图
      if (item.design_back) {
        const url = getImageUrl(item.design_back);
        console.log('Adding back design to batch download:', url);
        downloads.push(downloadImage(url, "背面设计图"));
        downloadCount++;
      }

      if (downloads.length === 0) {
        toast({
          title: "没有可下载的设计图",
          description: "该订单项目没有设计图文件",
          variant: "destructive",
        });
        return;
      }

      await Promise.all(downloads);
      toast({
        title: "批量下载成功",
        description: `已下载 ${downloadCount} 个设计文件`,
      });
    } catch (error: any) {
      console.error('Batch download error:', error);
      toast({
        title: "批量下载失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadImage = async (imageUrl: string, title: string): Promise<void> => {
    try {
      console.log('Downloading image from URL:', imageUrl);
      
      // 验证URL格式
      if (!imageUrl || (!isFullUrl(imageUrl) && !imageUrl.includes('design-images'))) {
        throw new Error(`无效的图片URL: ${imageUrl}`);
      }
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // 检查响应是否为图片
      if (!blob.type.startsWith('image/')) {
        throw new Error(`下载的文件不是图片格式: ${blob.type}`);
      }
      
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully downloaded: ${title}`);
    } catch (error) {
      console.error(`下载${title}失败:`, error);
      throw new Error(`下载${title}失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
                disabled={isDownloading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "下载中..." : "批量下载设计图"}
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
