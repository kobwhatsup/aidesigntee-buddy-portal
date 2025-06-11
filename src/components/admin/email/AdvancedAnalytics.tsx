
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  Eye, 
  MousePointer, 
  Users,
  Calendar,
  Download
} from "lucide-react";
import { format, subDays, subWeeks, subMonths } from "date-fns";

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [compareRange, setCompareRange] = useState("previous");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['advanced-analytics', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      let compareStartDate: Date;
      
      switch (timeRange) {
        case "7d":
          startDate = subDays(now, 7);
          compareStartDate = subDays(startDate, 7);
          break;
        case "30d":
          startDate = subDays(now, 30);
          compareStartDate = subDays(startDate, 30);
          break;
        case "90d":
          startDate = subDays(now, 90);
          compareStartDate = subDays(startDate, 90);
          break;
        default:
          startDate = subDays(now, 30);
          compareStartDate = subDays(startDate, 30);
      }

      // 获取当前周期数据
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*, email_sends(*)')
        .gte('created_at', startDate.toISOString());

      const { data: sends } = await supabase
        .from('email_sends')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // 获取对比周期数据
      const { data: compareCampaigns } = await supabase
        .from('email_campaigns')
        .select('*, email_sends(*)')
        .gte('created_at', compareStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const { data: compareSends } = await supabase
        .from('email_sends')
        .select('*')
        .gte('created_at', compareStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // 计算趋势数据
      const trendData = [];
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStr = format(date, 'yyyy-MM-dd');
        const daySends = sends?.filter(s => 
          format(new Date(s.created_at), 'yyyy-MM-dd') === dayStr
        ) || [];
        
        trendData.push({
          date: format(date, 'MM/dd'),
          sent: daySends.length,
          delivered: daySends.filter(s => s.status === 'delivered').length,
          opened: daySends.filter(s => s.opened_at).length,
          clicked: daySends.filter(s => s.clicked_at).length,
        });
      }

      // 计算关键指标
      const totalSent = sends?.length || 0;
      const totalDelivered = sends?.filter(s => s.status === 'delivered').length || 0;
      const totalOpened = sends?.filter(s => s.opened_at).length || 0;
      const totalClicked = sends?.filter(s => s.clicked_at).length || 0;

      const compareTotalSent = compareSends?.length || 0;
      const compareTotalOpened = compareSends?.filter(s => s.opened_at).length || 0;
      const compareTotalClicked = compareSends?.filter(s => s.clicked_at).length || 0;

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const compareOpenRate = compareTotalSent > 0 ? (compareTotalOpened / compareTotalSent) * 100 : 0;
      const compareClickRate = compareTotalSent > 0 ? (compareTotalClicked / compareTotalSent) * 100 : 0;

      return {
        metrics: {
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          openRate,
          clickRate,
          deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        },
        comparison: {
          sentChange: compareTotalSent > 0 ? ((totalSent - compareTotalSent) / compareTotalSent) * 100 : 0,
          openRateChange: compareOpenRate > 0 ? openRate - compareOpenRate : 0,
          clickRateChange: compareClickRate > 0 ? clickRate - compareClickRate : 0,
        },
        trendData,
        campaigns: campaigns || [],
      };
    },
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return <div className="flex justify-center p-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">高级数据分析</h2>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
          <TabsTrigger value="performance">活动表现</TabsTrigger>
          <TabsTrigger value="segments">分群分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">发送总量</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.metrics.totalSent || 0}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {analyticsData?.comparison.sentChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>{Math.abs(analyticsData?.comparison.sentChange || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">打开率</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analyticsData?.metrics.openRate || 0).toFixed(1)}%
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {analyticsData?.comparison.openRateChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>{Math.abs(analyticsData?.comparison.openRateChange || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">点击率</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analyticsData?.metrics.clickRate || 0).toFixed(1)}%
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {analyticsData?.comparison.clickRateChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>{Math.abs(analyticsData?.comparison.clickRateChange || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">送达率</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analyticsData?.metrics.deliveryRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.metrics.totalDelivered || 0} / {analyticsData?.metrics.totalSent || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>发送趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="#8884d8" 
                    name="发送量"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#82ca9d" 
                    name="送达量"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="opened" 
                    stroke="#ffc658" 
                    name="打开量"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicked" 
                    stroke="#ff7300" 
                    name="点击量"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>活动表现对比</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.campaigns?.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent_count" fill="#8884d8" name="发送量" />
                    <Bar dataKey="opened_count" fill="#82ca9d" name="打开量" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>邮件状态分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '已发送', value: analyticsData?.metrics.totalSent || 0 },
                        { name: '已送达', value: analyticsData?.metrics.totalDelivered || 0 },
                        { name: '已打开', value: analyticsData?.metrics.totalOpened || 0 },
                        { name: '已点击', value: analyticsData?.metrics.totalClicked || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {[].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>分群表现分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>分群表现分析功能开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
