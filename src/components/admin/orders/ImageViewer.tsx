
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  fileName?: string;
}

export function ImageViewer({ isOpen, onClose, imageUrl, title, fileName }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  // 检测是否为 base64 数据格式
  const isBase64Data = (data: string): boolean => {
    return data.startsWith('data:image/');
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('Downloading image from URL:', imageUrl);
      
      // 验证URL
      if (!imageUrl) {
        throw new Error('图片URL为空');
      }
      
      let blob: Blob;
      
      if (isBase64Data(imageUrl)) {
        // 处理 base64 数据
        console.log('Processing base64 image data');
        const response = await fetch(imageUrl);
        blob = await response.blob();
      } else {
        // 处理普通 URL
        console.log('Processing URL image data');
        
        // 创建一个临时的图片元素来测试URL是否有效
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        
        const testPromise = new Promise((resolve, reject) => {
          testImg.onload = resolve;
          testImg.onerror = () => reject(new Error('图片URL无效或无法访问'));
          testImg.src = imageUrl;
        });
        
        await testPromise;
        
        // 开始下载
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`下载失败: HTTP ${response.status} ${response.statusText}`);
        }

        blob = await response.blob();
      }
      
      // 验证下载的内容是图片
      if (!blob.type.startsWith('image/')) {
        throw new Error(`下载的文件不是图片格式: ${blob.type}`);
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `${title}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "下载成功",
        description: "设计图已保存到本地",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "下载失败",
        description: error.message || "下载失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-4xl'} p-0`}>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "下载中..." : "下载原图"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className={`overflow-auto ${isFullscreen ? 'h-[calc(95vh-80px)]' : 'max-h-[70vh]'} flex items-center justify-center bg-gray-50`}>
          <img
            src={imageUrl}
            alt={title}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            className="object-contain"
            onError={(e) => {
              console.error('Image load error in viewer:', imageUrl);
              toast({
                title: "图片加载失败",
                description: "无法加载设计图，请检查文件是否存在",
                variant: "destructive",
              });
            }}
            onLoad={() => {
              console.log('Image loaded successfully in viewer:', imageUrl);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
