
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Edit, Trash2, BarChart3, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ABTestEditor } from "./ABTestEditor";
import { ABTestResults } from "./ABTestResults";

export function ABTestManager() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [resultsTestId, setResultsTestId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: tests, isLoading, refetch } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select(`
          *,
          email_campaigns(name),
          email_ab_test_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateTest = () => {
    setSelectedTest(null);
    setIsEditorOpen(true);
  };

  const handleEditTest = (test: any) => {
    setSelectedTest(test);
    setIsEditorOpen(true);
  };

  const handleToggleTest = async (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';
    
    const { error } = await supabase
      .from('email_ab_tests')
      .update({ 
        status: newStatus,
        start_date: newStatus === 'running' ? new Date().toISOString() : undefined
      })
      .eq('id', testId);

    if (error) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "操作成功",
        description: `A/B测试已${newStatus === 'running' ? '启动' : '暂停'}`,
      });
      refetch();
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('确定要删除这个A/B测试吗？')) return;

    const { error } = await supabase
      .from('email_ab_tests')
      .delete()
      .eq('id', testId);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "删除成功",
        description: "A/B测试已删除",
      });
      refetch();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary' as const, label: '草稿' },
      'running': { variant: 'default' as const, label: '运行中' },
      'completed': { variant: 'outline' as const, label: '已完成' },
      'paused': { variant: 'destructive' as const, label: '已暂停' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  const calculateConversionRate = (variant: any): string => {
    if (!variant.sent_count || variant.sent_count === 0) return "0.00";
    return ((variant.conversion_count || 0) / variant.sent_count * 100).toFixed(2);
  };

  const getWinningVariant = (test: any) => {
    if (!test.email_ab_test_variants || test.email_ab_test_variants.length < 2) return null;
    
    const variants = test.email_ab_test_variants;
    let winner = variants[0];
    
    for (const variant of variants) {
      const currentRate = parseFloat(calculateConversionRate(variant));
      const winnerRate = parseFloat(calculateConversionRate(winner));
      if (currentRate > winnerRate) {
        winner = variant;
      }
    }
    
    return winner;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">A/B测试管理</h2>
        <Button onClick={handleCreateTest}>
          <Plus className="h-4 w-4 mr-2" />
          创建A/B测试
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests?.map((test) => {
          const statusConfig = getStatusBadge(test.status);
          const winner = getWinningVariant(test);
          
          return (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                    {test.status === 'running' || test.status === 'paused' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleTest(test.id, test.status)}
                      >
                        {test.status === 'running' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {test.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {test.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">测试类型:</span> {test.test_type}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">营销活动:</span> {test.email_campaigns?.name || '未关联'}
                  </div>

                  {test.email_ab_test_variants && test.email_ab_test_variants.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">变体表现:</div>
                      {test.email_ab_test_variants.map((variant: any) => (
                        <div key={variant.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">变体 {variant.variant_name}</span>
                            {winner && winner.id === variant.id && (
                              <Trophy className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-right">
                            <div>{calculateConversionRate(variant)}% 转化率</div>
                            <div className="text-gray-500">{variant.sent_count || 0} 发送</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {test.statistical_significance && (
                    <div className="text-sm">
                      <span className="font-medium">统计显著性:</span> {test.statistical_significance}%
                    </div>
                  )}

                  {(test.start_date || test.end_date) && (
                    <div className="text-xs text-gray-500">
                      {test.start_date && (
                        <div>开始: {format(new Date(test.start_date), 'yyyy-MM-dd HH:mm')}</div>
                      )}
                      {test.end_date && (
                        <div>结束: {format(new Date(test.end_date), 'yyyy-MM-dd HH:mm')}</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setResultsTestId(test.id)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTest(test)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {test.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tests?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无A/B测试</h3>
          <p className="text-gray-600 mb-4">创建您的第一个A/B测试，优化邮件营销效果</p>
          <Button onClick={handleCreateTest}>
            <Plus className="h-4 w-4 mr-2" />
            创建A/B测试
          </Button>
        </div>
      )}

      <ABTestEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        test={selectedTest}
        onSave={refetch}
      />

      {resultsTestId && (
        <ABTestResults
          testId={resultsTestId}
          onClose={() => setResultsTestId(null)}
        />
      )}
    </div>
  );
}
