
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon, 
  Upload, 
  Search,
  Copy,
  Trash2,
  Tag,
  FileImage
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageLibraryProps {
  onSelectImage: (imageUrl: string) => void;
}

export function ImageLibrary({ onSelectImage }: ImageLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images, isLoading } = useQuery({
    queryKey: ['email-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      // 上传文件到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('email-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('email-images')
        .getPublicUrl(filePath);

      // 获取图片尺寸
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 保存图片信息到数据库
      const { data, error } = await supabase
        .from('email_images')
        .insert({
          filename: fileName,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          public_url: publicUrl,
          width: img.width,
          height: img.height,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-images'] });
      toast({
        title: "上传成功",
        description: "图片已成功上传到图片库",
      });
    },
    onError: (error: any) => {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (image: any) => {
      // 从存储桶删除文件
      const { error: storageError } = await supabase.storage
        .from('email-images')
        .remove([image.storage_path]);

      if (storageError) throw storageError;

      // 从数据库删除记录
      const { error } = await supabase
        .from('email_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-images'] });
      toast({
        title: "删除成功",
        description: "图片已成功删除",
      });
    },
    onError: (error: any) => {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "文件类型错误",
          description: "请选择图片文件",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "已复制",
      description: "图片URL已复制到剪贴板",
    });
  };

  const handleSelectImage = (url: string) => {
    onSelectImage(url);
    toast({
      title: "图片已选择",
      description: "图片已添加到编辑器中",
    });
  };

  // 获取所有标签
  const allTags = Array.from(new Set(
    images?.flatMap(img => img.tags || []) || []
  ));

  const filteredImages = images?.filter(image => {
    const matchesSearch = image.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || image.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            图片库
          </div>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-1" />
            {uploadMutation.isPending ? '上传中...' : '上传图片'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 搜索和过滤 */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索图片..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                全部
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* 图片网格 */}
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredImages?.map((image) => (
            <div
              key={image.id}
              className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              <div className="aspect-video relative group">
                <img 
                  src={image.public_url} 
                  alt={image.alt_text || image.original_filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSelectImage(image.public_url)}
                  >
                    <FileImage className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyUrl(image.public_url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(image)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="p-2">
                <p className="text-xs font-medium truncate">{image.original_filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {image.width} × {image.height}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(image.file_size / 1024).toFixed(1)}KB
                  </span>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {image.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div>加载图片中...</div>
          </div>
        )}

        {filteredImages?.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>没有找到图片</p>
            <p className="text-xs mt-1">点击上传按钮添加图片到库中</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
