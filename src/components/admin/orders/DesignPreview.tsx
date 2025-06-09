
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ImageViewer } from "./ImageViewer";
import { Eye, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [imageErrors, setImageErrors] = useState({
    preview: false,
    design: false
  });
  const { toast } = useToast();

  // 检测是否为 base64 数据格式
  const isBase64Data = (data: string): boolean => {
    return data.startsWith('data:image/');
  };

  // 判断是否为完整URL
  const isFullUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // 获取图片URL的函数 - 修复URL处理逻辑
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // 如果是 base64 数据，直接返回
    if (isBase64Data(imagePath)) {
      console.log('Image data is base64 format');
      return imagePath;
    }
    
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

  // 验证URL是否可访问（跳过 base64 数据）
  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      if (isBase64Data(url)) {
        return true; // base64 数据默认有效
      }
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('URL validation failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // 处理预览图URL
    if (previewImage) {
      setLoadingStates(prev => ({ ...prev, preview: true }));
      setImageErrors(prev => ({ ...prev, preview: false }));
      
      const url = getImageUrl(previewImage);
      console.log('Processing preview image URL:', url);
      
      // 验证URL
      validateImageUrl(url).then(isValid => {
        if (isValid) {
          setPreviewUrl(url);
        } else {
          console.error('Preview image URL validation failed:', url);
          setImageErrors(prev => ({ ...prev, preview: true }));
        }
        setLoadingStates(prev => ({ ...prev, preview: false }));
      });
    }

    // 处理设计图URL
    if (designImage) {
      setLoadingStates(prev => ({ ...prev, design: true }));
      setImageErrors(prev => ({ ...prev, design: false }));
      
      const url = getImageUrl(designImage);
      console.log('Processing design image URL:', url);
      
      // 验证URL
      validateImageUrl(url).then(isValid => {
        if (isValid) {
          setDesignUrl(url);
        } else {
          console.error('Design image URL validation failed:', url);
          setImageErrors(prev => ({ ...prev, design: true }));
        }
        setLoadingStates(prev => ({ ...prev, design: false }));
      });
    }
  }, [previewImage, designImage]);

  const handleViewImage = (url: string, imageTitle: string, fileName?: string) => {
    console.log('Opening image viewer for:', imageTitle, url);
    setSelectedImage({ url, title: imageTitle, fileName });
  };

  const handleDownloadImage = async (url: string, fileName: string) => {
    try {
      console.log('Starting download for:', fileName, 'from URL:', url);
      
      let blob: Blob;
      
      if (isBase64Data(url)) {
        // 处理 base64 数据
        const response = await fetch(url);
        blob = await response.blob();
      } else {
        // 处理普通 URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`下载失败: HTTP ${response.status}`);
        }
        blob = await response.blob();
      }
      
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "下载成功",
        description: `${fileName} 已保存到本地`,
      });
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        title: "下载失败",
        description: error.message || "下载失败，请重试",
        variant: "destructive",
      });
    }
  };

  const renderImageContainer = (
    url: string,
    altText: string,
    title: string,
    isLoading: boolean,
    hasError: boolean,
    onRetry: () => void
  ) => (
    <div className="relative aspect-square w-full max-w-[300px] mx-auto border rounded-lg overflow-hidden bg-gray-50">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-500">加载中...</span>
        </div>
      ) : hasError || !url ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm text-center mb-2">图片加载失败</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="text-xs"
          >
            重试
          </Button>
        </div>
      ) : (
        <>
          <img
            src={url}
            alt={altText}
            className="object-contain w-full h-full"
            onLoad={() => console.log(`${title} loaded successfully`)}
            onError={(e) => {
              console.error(`Failed to load ${title}:`, url);
              setImageErrors(prev => ({
                ...prev,
                [title.includes('设计原图') ? 'design' : 'preview']: true
              }));
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleViewImage(url, title, `${title}-${Date.now()}.png`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              查看
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownloadImage(url, `${title}-${Date.now()}.png`)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="space-y-4">
        {/* 设计原图 */}
        {designImage && (
          <div>
            <h5 className="text-sm font-medium mb-2">设计原图：</h5>
            {renderImageContainer(
              designUrl,
              `${title}设计原图`,
              `${title}设计原图`,
              loadingStates.design,
              imageErrors.design,
              () => {
                setImageErrors(prev => ({ ...prev, design: false }));
                const url = getImageUrl(designImage);
                validateImageUrl(url).then(isValid => {
                  if (isValid) {
                    setDesignUrl(url);
                  } else {
                    setImageErrors(prev => ({ ...prev, design: true }));
                  }
                });
              }
            )}
          </div>
        )}

        {/* 预览效果图 */}
        {previewImage && (
          <div>
            <h5 className="text-sm font-medium mb-2">预览效果：</h5>
            {renderImageContainer(
              previewUrl,
              `${title}预览图`,
              `${title}预览图`,
              loadingStates.preview,
              imageErrors.preview,
              () => {
                setImageErrors(prev => ({ ...prev, preview: false }));
                const url = getImageUrl(previewImage);
                validateImageUrl(url).then(isValid => {
                  if (isValid) {
                    setPreviewUrl(url);
                  } else {
                    setImageErrors(prev => ({ ...prev, preview: true }));
                  }
                });
              }
            )}
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
