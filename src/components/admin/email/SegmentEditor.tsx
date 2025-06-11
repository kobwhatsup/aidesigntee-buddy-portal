
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SegmentEngine } from "@/utils/segmentEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SegmentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  segment?: any;
  onSave: () => void;
}

export function SegmentEditor({ isOpen, onClose, segment, onSave }: SegmentEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [conditions, setConditions] = useState(segment?.conditions || {});
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: segment?.name || '',
      description: segment?.description || '',
      is_dynamic: segment?.is_dynamic ?? true,
    }
  });

  const presetConditions = SegmentEngine.getPresetConditions();

  const handlePreviewSegment = async () => {
    try {
      const query = SegmentEngine.buildQuery(conditions);
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or(query);

      if (error) throw error;
      setPreviewCount(count || 0);
    } catch (error: any) {
      toast({
        title: "预览失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = presetConditions[presetKey as keyof typeof presetConditions];
    setConditions(preset.conditions);
    setValue('name', preset.name);
    setPreviewCount(null);
  };

  const updateCondition = (key: string, value: any) => {
    setConditions(prev => ({
      ...prev,
      [key]: value
    }));
    setPreviewCount(null);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const segmentData = {
        ...data,
        conditions,
        created_by: user?.id,
      };

      if (segment) {
        const { error } = await supabase
          .from('user_segments')
          .update(segmentData)
          .eq('id', segment.id);

        if (error) throw error;
        
        toast({
          title: "更新成功",
          description: "用户分群已更新",
        });
      } else {
        const { error } = await supabase
          .from('user_segments')
          .insert(segmentData);

        if (error) throw error;
        
        toast({
          title: "创建成功",
          description: "用户分群已创建",
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {segment ? '编辑用户分群' : '创建用户分群'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分群名称</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="输入分群名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">分群描述</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="输入分群描述"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_dynamic"
                  checked={watch('is_dynamic')}
                  onCheckedChange={(checked) => setValue('is_dynamic', checked)}
                />
                <Label htmlFor="is_dynamic">动态分群（自动更新用户列表）</Label>
              </div>

              <div className="space-y-2">
                <Label>预设分群模板</Label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(presetConditions).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleApplyPreset(key)}
                      className="justify-start"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">分群条件</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>注册时间</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={conditions.created_after?.split('T')[0] || ''}
                        onChange={(e) => updateCondition('created_after', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                        placeholder="开始日期"
                      />
                      <Input
                        type="date"
                        value={conditions.created_before?.split('T')[0] || ''}
                        onChange={(e) => updateCondition('created_before', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                        placeholder="结束日期"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>订单条件</Label>
                    <Select
                      value={conditions.has_orders?.toString() || 'all'}
                      onValueChange={(value) => updateCondition('has_orders', value === 'all' ? undefined : value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择订单条件" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">不限制</SelectItem>
                        <SelectItem value="true">有订单</SelectItem>
                        <SelectItem value="false">无订单</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>最低订单金额</Label>
                    <Input
                      type="number"
                      value={conditions.min_order_amount || ''}
                      onChange={(e) => updateCondition('min_order_amount', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="输入最低金额"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>最少订单数量</Label>
                    <Input
                      type="number"
                      value={conditions.order_count_min || ''}
                      onChange={(e) => updateCondition('order_count_min', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="输入最少订单数"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>设计条件</Label>
                    <Select
                      value={conditions.has_designs?.toString() || 'all'}
                      onValueChange={(value) => updateCondition('has_designs', value === 'all' ? undefined : value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择设计条件" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">不限制</SelectItem>
                        <SelectItem value="true">有设计</SelectItem>
                        <SelectItem value="false">无设计</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>最少设计数量</Label>
                    <Input
                      type="number"
                      value={conditions.design_count_min || ''}
                      onChange={(e) => updateCondition('design_count_min', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="输入最少设计数"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">分群预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviewSegment}
                      className="w-full"
                    >
                      预览用户数量
                    </Button>
                    {previewCount !== null && (
                      <div className="text-center">
                        <Badge variant="default" className="text-lg p-2">
                          符合条件用户: {previewCount} 人
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : (segment ? '更新' : '创建')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
