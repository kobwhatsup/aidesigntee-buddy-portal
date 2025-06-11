
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Trophy, TrendingUp, Users, Mail, MousePointer } from "lucide-react";

interface ABTestResultsProps {
  testId: string;
  onClose: () => void;
}

export function ABTestResults({ testId, onClose }: ABTestResultsProps) {
  const { data: test, isLoading } = useQuery({
    queryKey: ['ab-test-results', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select(`
          *,
          email_campaigns(name),
          email_ab_test_variants(*)
        `)
        .eq('id', testId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const calculateMetrics = (variant: any) => {
    const sent = variant.sent_count || 0;
    const delivered = variant.delivered_count || 0;
    const opened = variant.opened_count || 0;
    const clicked = variant.clicked_count || 0;
    const conversions = variant.conversion_count || 0;

    return {
      deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(2) : '0.00',
      openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : '0.00',
      clickRate: delivered > 0 ? ((clicked / delivered) * 100).toFixed(2) : '0.00',
      conversionRate: delivered > 0 ? ((conversions / delivered) * 100).toFixed(2) : '0.00',
      clickToOpenRate: opened > 0 ? ((clicked / opened) * 100).toFixed(2) : '0.00',
    };
  };

  const getWinner = () => {
    if (!test?.email_ab_test_variants) return null;
    
    return test.email_ab_test_variants.reduce((winner: any, variant: any) => {
      const winnerMetrics = calculateMetrics(winner);
      const variantMetrics = calculateMetrics(variant);
      
      return parseFloat(variantMetrics.conversionRate) > parseFloat(winnerMetrics.conversionRate) 
        ? variant 
        : winner;
    });
  };

  const getChartData = () => {
    if (!test?.email_ab_test_variants) return [];
    
    return test.email_ab_test_variants.map((variant: any) => ({
      name: `变体 ${variant.variant_name}`,
      sent: variant.sent_count || 0,
      delivered: variant.delivered_count || 0,
      opened: variant.opened_count || 0,
      clicked: variant.clicked_count || 0,
      conversions: variant.conversion_count || 0,
      deliveryRate: parseFloat(calculateMetrics(variant).deliveryRate),
      openRate: parseFloat(calculateMetrics(variant).openRate),
      clickRate: parseFloat(calculateMetrics(variant).clickRate),
      conversionRate: parseFloat(calculateMetrics(variant).conversionRate),
    }));
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center p-8">加载中...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const winner = getWinner();
  const chartData = getChartData();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            A/B测试结果 - {test?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 测试概览 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                测试概览
                <Badge variant={test?.status === 'completed' ? 'default' : 'secondary'}>
                  {test?.status === 'completed' ? '已完成' : '进行中'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {test?.email_ab_test_variants?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">测试变体</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {test?.confidence_level}%
                  </div>
                  <div className="text-sm text-gray-600">置信度</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {test?.statistical_significance || 0}%
                  </div>
                  <div className="text-sm text-gray-600">统计显著性</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {winner ? `变体 ${winner.variant_name}` : '暂无'}
                  </div>
                  <div className="text-sm text-gray-600">当前领先</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 变体对比 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {test?.email_ab_test_variants?.map((variant: any) => {
              const metrics = calculateMetrics(variant);
              const isWinner = winner && winner.id === variant.id;
              
              return (
                <Card key={variant.id} className={isWinner ? 'ring-2 ring-yellow-400' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      变体 {variant.variant_name}
                      {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>流量分配</span>
                        <span>{variant.traffic_percentage}%</span>
                      </div>
                      <Progress value={variant.traffic_percentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{variant.sent_count || 0}</div>
                          <div className="text-gray-500">已发送</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium">{metrics.openRate}%</div>
                          <div className="text-gray-500">打开率</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="font-medium">{metrics.clickRate}%</div>
                          <div className="text-gray-500">点击率</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium">{metrics.conversionRate}%</div>
                          <div className="text-gray-500">转化率</div>
                        </div>
                      </div>
                    </div>

                    {variant.subject_line && (
                      <div className="text-xs">
                        <div className="font-medium text-gray-700">主题行:</div>
                        <div className="text-gray-600 truncate">{variant.subject_line}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 性能对比图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>发送数据对比</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#3B82F6" name="发送" />
                    <Bar dataKey="delivered" fill="#10B981" name="送达" />
                    <Bar dataKey="opened" fill="#8B5CF6" name="打开" />
                    <Bar dataKey="clicked" fill="#F59E0B" name="点击" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>转化率对比</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Line 
                      type="monotone" 
                      dataKey="openRate" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="打开率"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clickRate" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="点击率"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="转化率"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
