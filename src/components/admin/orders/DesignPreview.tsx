
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { ImageViewer } from "./ImageViewer";
import { Eye, Download, AlertCircle } from "lucide-react";

interface DesignPreviewProps {
  title: string;
  designImage?: string;
  previewImage?: string;
}

export function DesignPreview({ title, designImage, previewImage }: DesignPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [designUrl, setDesignUrl] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<{url: string; title: string; fileName?: string} | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    preview: false,
    design: false
  });

  // 判断是否为完整URL
  const isFullUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // 获取图片URL的函数
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // 如果已经是完整URL，直接返回
    if (isFullUrl(imagePath)) {
      return imagePath;
    }
    
    // 如果是相对路径，构建完整的Supabase Storage URL
    return `https://gfraqpwyfxmpzdllsfoc.supabase.co/storage/v1/object/public/design-images/${imagePath}`;
  };

  useEffect(() => {
    // 获取预览图URL
    if (previewImage) {
      setLoadingStates(prev => ({...prev, preview: true}));
      try {
        const url = getImageUrl(previewImage);
        console.log('Preview image URL:', url);
        setPreviewUrl(url);
      } catch (error) {
        console.error('Error processing preview URL:', error);
      } finally {
        setLoadingStates(prev => ({...prev, preview: false}));
      }
    }

    // 获取设计图URL
    if (designImage) {
      setLoadingStates(prev => ({...prev, design: true}));
      try {
        const url = getImageUrl(designImage);
        console.log('Design image URL:', url);
        setDesignUrl(url);
      } catch (error) {
        console.error('Error processing design URL:', error);
      } finally {
        setLoadingStates(prev => ({...prev, design: false}));
      }
    }
  }, [previewImage, designImage]);

  const handleViewImage = (url: string, imageTitle: string, fileName?: string) => {
    setSelectedImage({ url, title: imageTitle, fileName });
  };

  const handleDownloadImage = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('图片下载失败');
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请重试');
    }
  };

  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="space-y-4">
        {/* 设计原图 */}
        {designImage && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              设计原图：
              {loadingStates.design && <span className="text-xs text-gray-500">加载中...</span>}
            </h5>
            <div className="relative aspect-square w-full max-w-[300px] mx-auto border rounded-lg overflow-hidden bg-gray-50">
              {designUrl ? (
                <>
                  <img
                    src={designUrl}
                    alt={`${title}设计原图`}
                    className="object-contain w-full h-full"
                    onLoad={() => console.log('Design image loaded successfully')}
                    onError={(e) => {
                      console.error('Failed to load design image:', designUrl);
                      console.error('Original path:', designImage);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewImage(designUrl, `${title}设计原图`, `${title}-design-${Date.now()}.png`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadImage(designUrl, `${title}-design-${Date.now()}.png`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center">
                    设计图加载失败
                    <br />
                    <span className="text-xs">路径: {designImage}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 预览效果图 */}
        {previewImage && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              预览效果：
              {loadingStates.preview && <span className="text-xs text-gray-500">加载中...</span>}
            </h5>
            <div className="relative aspect-square w-full max-w-[300px] mx-auto border rounded-lg overflow-hidden bg-gray-50">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={`${title}预览图`}
                    className="object-contain w-full h-full"
                    onLoad={() => console.log('Preview image loaded successfully')}
                    onError={(e) => {
                      console.error('Failed to load preview image:', previewUrl);
                      console.error('Original path:', previewImage);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewImage(previewUrl, `${title}预览图`, `${title}-preview-${Date.now()}.png`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadImage(previewUrl, `${title}-preview-${Date.now()}.png`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center">
                    预览图加载失败
                    <br />
                    <span className="text-xs">路径: {previewImage}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 图片查看器 */}
      {selectedImage && (
        <ImageViewer
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          fileName={selectedImage.fileName}
        />
      )}
    </div>
  );
}
