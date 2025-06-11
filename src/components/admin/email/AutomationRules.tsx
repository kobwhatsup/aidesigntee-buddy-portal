
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Edit, Trash2, Zap } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AutomationEditor } from "./AutomationEditor";

export function AutomationRules() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const { toast } = useToast();

  const { data: rules, isLoading, refetch } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_automation_rules')
        .select(`
          *,
          email_templates(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateRule = () => {
    setSelectedRule(null);
    setIsEditorOpen(true);
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    setIsEditorOpen(true);
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('email_automation_rules')
      .update({ is_active: !isActive })
      .eq('id', ruleId);

    if (error) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "操作成功",
        description: `自动化规则已${!isActive ? '启用' : '停用'}`,
      });
      refetch();
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('确定要删除这个自动化规则吗？')) return;

    const { error } = await supabase
      .from('email_automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "删除成功",
        description: "自动化规则已删除",
      });
      refetch();
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'user_signup': '用户注册',
      'order_completed': '订单完成',
      'order_shipped': '订单发货',
      'cart_abandoned': '购物车遗弃',
      'user_inactive': '用户不活跃',
      'birthday': '生日提醒',
      'subscription_expiry': '订阅到期',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">邮件自动化</h2>
        <Button onClick={handleCreateRule}>
          <Plus className="h-4 w-4 mr-2" />
          创建自动化规则
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules?.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "运行中" : "已停用"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRule(rule.id, rule.is_active)}
                  >
                    {rule.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {rule.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {rule.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">触发条件:</span>
                  <Badge variant="outline">
                    {getTriggerTypeLabel(rule.trigger_type)}
                  </Badge>
                </div>

                {rule.delay_minutes > 0 && (
                  <div className="text-sm text-gray-600">
                    延迟发送: {rule.delay_minutes} 分钟
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  模板: {rule.email_templates?.name || '未选择'}
                </div>

                <div className="text-xs text-gray-500">
                  创建时间: {format(new Date(rule.created_at), 'yyyy-MM-dd HH:mm')}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无自动化规则</h3>
          <p className="text-gray-600 mb-4">创建您的第一个自动化规则，提高营销效率</p>
          <Button onClick={handleCreateRule}>
            <Plus className="h-4 w-4 mr-2" />
            创建自动化规则
          </Button>
        </div>
      )}

      <AutomationEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        rule={selectedRule}
        onSave={refetch}
      />
    </div>
  );
}
