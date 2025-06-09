
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ZoomIn, ZoomOut, RotateCw, Maximize2, X } from "lucide-react";
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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('Downloading image from URL:', imageUrl);
      
      // 直接使用传入的URL进行下载
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
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
            onError={() => {
              toast({
                title: "图片加载失败",
                description: "无法加载设计图，请检查文件是否存在",
                variant: "destructive",
              });
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
