
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Play, Pause, BarChart3, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function ABTestManager() {
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const { toast } = useToast();

  // 暂时使用模拟数据，后续需要创建相应的数据表
  const mockABTests = [
    {
      id: '1',
      name: '春季促销邮件主题测试',
      status: 'running',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      variants: [
        {
          name: '版本A：直接折扣',
          subject: '🎉 春季大促，全场8折优惠！',
          sent_count: 1000,
          open_rate: 25.5,
          click_rate: 3.2,
          conversion_rate: 1.8,
        },
        {
          name: '版本B：限时抢购',
          subject: '⏰ 限时48小时，春季商品抢购开始！',
          sent_count: 1000,
          open_rate: 28.3,
          click_rate: 4.1,
          conversion_rate: 2.3,
        }
      ],
      winner: null,
      confidence: 85,
    },
    {
      id: '2',
      name: '欢迎邮件内容测试',
      status: 'completed',
      start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      variants: [
        {
          name: '版本A：产品介绍',
          subject: '欢迎加入我们！了解更多产品',
          sent_count: 500,
          open_rate: 45.2,
          click_rate: 8.5,
          conversion_rate: 3.2,
        },
        {
          name: '版本B：品牌故事',
          subject: '欢迎加入我们！了解我们的故事',
          sent_count: 500,
          open_rate: 52.1,
          click_rate: 12.3,
          conversion_rate: 5.8,
        }
      ],
      winner: 'B',
      confidence: 95,
    }
  ];

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': '草稿',
      'running': '进行中',
      'completed': '已完成',
      'paused': '已暂停'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'secondary',
      'running': 'default',
      'completed': 'default',
      'paused': 'secondary'
    };
    return colorMap[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">A/B测试管理</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建A/B测试
        </Button>
      </div>

      <div className="grid gap-6">
        {mockABTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant={getStatusColor(test.status) as any}>
                      {getStatusLabel(test.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(test.start_date), 'yyyy-MM-dd')} - {format(new Date(test.end_date), 'yyyy-MM-dd')}
                    </span>
                    {test.winner && (
                      <Badge variant="default" className="bg-green-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        版本{test.winner}获胜
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {test.status === 'running' && (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {test.confidence && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>统计置信度</span>
                      <span>{test.confidence}%</span>
                    </div>
                    <Progress value={test.confidence} className="h-2" />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {test.variants.map((variant, index) => (
                    <div 
                      key={index} 
                      className={`p-4 border rounded-lg ${
                        test.winner === String.fromCharCode(65 + index) 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{variant.name}</h4>
                        {test.winner === String.fromCharCode(65 + index) && (
                          <Badge variant="default" className="bg-green-500">
                            <Trophy className="h-3 w-3 mr-1" />
                            获胜
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{variant.subject}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">发送量:</span>
                          <span className="font-medium ml-1">{variant.sent_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">打开率:</span>
                          <span className="font-medium ml-1">{variant.open_rate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">点击率:</span>
                          <span className="font-medium ml-1">{variant.click_rate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">转化率:</span>
                          <span className="font-medium ml-1">{variant.conversion_rate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockABTests.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无A/B测试</h3>
          <p className="text-gray-600 mb-4">创建您的第一个A/B测试，优化邮件营销效果</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            创建A/B测试
          </Button>
        </div>
      )}
    </div>
  );
}
