
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

  useEffect(() => {
    async function getImageUrls() {
      // 获取预览图URL
      if (previewImage) {
        setLoadingStates(prev => ({...prev, preview: true}));
        try {
          const { data } = supabase.storage
            .from('design-images')
            .getPublicUrl(previewImage);
          
          if (data) {
            console.log('Preview URL:', data.publicUrl);
            setPreviewUrl(data.publicUrl);
          }
        } catch (error) {
          console.error('Error getting preview URL:', error);
        } finally {
          setLoadingStates(prev => ({...prev, preview: false}));
        }
      }

      // 获取设计图URL
      if (designImage) {
        setLoadingStates(prev => ({...prev, design: true}));
        try {
          const { data } = supabase.storage
            .from('design-images')
            .getPublicUrl(designImage);
          
          if (data) {
            console.log('Design URL:', data.publicUrl);
            setDesignUrl(data.publicUrl);
          }
        } catch (error) {
          console.error('Error getting design URL:', error);
        } finally {
          setLoadingStates(prev => ({...prev, design: false}));
        }
      }
    }

    getImageUrls();
  }, [previewImage, designImage]);

  const handleViewImage = (url: string, imageTitle: string, fileName?: string) => {
    setSelectedImage({ url, title: imageTitle, fileName });
  };

  const handleDownloadImage = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
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
                    onError={(e) => {
                      console.error('Failed to load design image:', designUrl);
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
                <div className="flex items-center justify-center h-full text-gray-400">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm">设计图加载失败</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 预览效果图 */}
        {previewUrl && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              预览效果：
              {loadingStates.preview && <span className="text-xs text-gray-500">加载中...</span>}
            </h5>
            <div className="relative aspect-square w-full max-w-[300px] mx-auto border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={previewUrl}
                alt={`${title}预览图`}
                className="object-contain w-full h-full"
                onError={(e) => {
                  console.error('Failed to load preview image:', previewUrl);
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
