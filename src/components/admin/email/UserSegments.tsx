
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Edit, Trash2, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SegmentEditor } from "./SegmentEditor";
import { SegmentPreview } from "./SegmentPreview";
import { SegmentCalculator } from "@/utils/segmentCalculator";

export function UserSegments() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: segments, isLoading, refetch } = useQuery({
    queryKey: ['user-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateSegment = () => {
    setSelectedSegment(null);
    setIsEditorOpen(true);
  };

  const handleEditSegment = (segment: any) => {
    setSelectedSegment(segment);
    setIsEditorOpen(true);
  };

  const handlePreviewSegment = (segment: any) => {
    setSelectedSegment(segment);
    setIsPreviewOpen(true);
  };

  const handleUpdateSegmentCount = async (segmentId: string) => {
    setIsUpdating(segmentId);
    try {
      const count = await SegmentCalculator.calculateSegmentUserCount(segmentId);
      toast({
        title: "更新成功",
        description: `用户数量已更新为 ${count} 人`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('确定要删除这个用户分群吗？')) return;

    const { error } = await supabase
      .from('user_segments')
      .delete()
      .eq('id', segmentId);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "删除成功",
        description: "用户分群已删除",
      });
      refetch();
    }
  };

  const handleUpdateAllCounts = async () => {
    setIsUpdating('all');
    try {
      await SegmentCalculator.updateAllSegmentCounts();
      toast({
        title: "更新成功",
        description: "所有分群用户数量已更新",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">用户分群</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleUpdateAllCounts}
            disabled={isUpdating === 'all'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating === 'all' ? 'animate-spin' : ''}`} />
            更新所有分群
          </Button>
          <Button onClick={handleCreateSegment}>
            <Plus className="h-4 w-4 mr-2" />
            创建分群
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments?.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{segment.name}</CardTitle>
                <Badge variant={segment.is_dynamic ? "default" : "secondary"}>
                  {segment.is_dynamic ? "动态" : "静态"}
                </Badge>
              </div>
              {segment.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {segment.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">用户数量:</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {segment.user_count || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateSegmentCount(segment.id)}
                      disabled={isUpdating === segment.id}
                    >
                      <RefreshCw className={`h-3 w-3 ${isUpdating === segment.id ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  创建时间: {format(new Date(segment.created_at), 'yyyy-MM-dd HH:mm')}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreviewSegment(segment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditSegment(segment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSegment(segment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户分群</h3>
          <p className="text-gray-600 mb-4">创建您的第一个用户分群，开始精准营销</p>
          <Button onClick={handleCreateSegment}>
            <Plus className="h-4 w-4 mr-2" />
            创建分群
          </Button>
        </div>
      )}

      <SegmentEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        segment={selectedSegment}
        onSave={refetch}
      />

      <SegmentPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        segment={selectedSegment}
      />
    </div>
  );
}
