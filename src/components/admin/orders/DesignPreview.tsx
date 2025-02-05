import { Button } from "@/components/ui/button";

interface DesignPreviewProps {
  title: string;
  designImage?: string;
  previewImage?: string;
}

export function DesignPreview({ title, designImage, previewImage }: DesignPreviewProps) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}：</h4>
      <div className="space-y-4">
        {designImage && (
          <div className="relative aspect-square w-full max-w-[300px] mx-auto">
            <img
              src={designImage}
              alt={`${title}设计图`}
              className="object-contain w-full h-full border rounded-lg"
            />
            <Button
              className="absolute top-2 right-2"
              variant="secondary"
              size="sm"
              onClick={() => window.open(designImage, '_blank')}
            >
              查看原图
            </Button>
          </div>
        )}
        {previewImage && (
          <div>
            <h5 className="text-sm font-medium mb-2">预览效果：</h5>
            <div className="relative aspect-square w-full max-w-[300px] mx-auto">
              <img
                src={previewImage}
                alt={`${title}预览图`}
                className="object-contain w-full h-full border rounded-lg"
              />
              <Button
                className="absolute top-2 right-2"
                variant="secondary"
                size="sm"
                onClick={() => window.open(previewImage, '_blank')}
              >
                查看原图
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}