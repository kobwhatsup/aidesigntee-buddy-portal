
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from "recharts";

interface UserBehaviorAnalysisProps {
  isLoading: boolean;
}

// 模拟用户行为数据
const pageViewData = [
  { hour: '00:00', views: 120, uniqueUsers: 80 },
  { hour: '03:00', views: 80, uniqueUsers: 60 },
  { hour: '06:00', views: 200, uniqueUsers: 150 },
  { hour: '09:00', views: 800, uniqueUsers: 600 },
  { hour: '12:00', views: 1200, uniqueUsers: 900 },
  { hour: '15:00', views: 1000, uniqueUsers: 750 },
  { hour: '18:00', views: 1400, uniqueUsers: 1000 },
  { hour: '21:00', views: 1600, uniqueUsers: 1200 },
];

const userJourneyData = [
  { step: '首页访问', users: 1000, conversion: 100 },
  { step: '浏览设计', users: 650, conversion: 65 },
  { step: '选择样式', users: 400, conversion: 40 },
  { step: '加入购物车', users: 280, conversion: 28 },
  { step: '开始结账', users: 180, conversion: 18 },
  { step: '完成支付', users: 120, conversion: 12 },
];

const sessionDurationData = [
  { duration: '0-30秒', users: 180, percentage: 18 },
  { duration: '30秒-2分钟', users: 250, percentage: 25 },
  { duration: '2-5分钟', users: 300, percentage: 30 },
  { duration: '5-10分钟', users: 180, percentage: 18 },
  { duration: '10分钟+', users: 90, percentage: 9 },
];

export function UserBehaviorAnalysis({ isLoading }: UserBehaviorAnalysisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">用户行为分析</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户访问热力图 */}
        <Card>
          <CardHeader>
            <CardTitle>24小时访问热力图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  views: {
                    label: "页面浏览量",
                    theme: {
                      light: "#8884d8",
                      dark: "#8884d8",
                    },
                  },
                  uniqueUsers: {
                    label: "独立用户",
                    theme: {
                      light: "#82ca9d",
                      dark: "#82ca9d",
                    },
                  },
                }}
              >
                <AreaChart data={pageViewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="页面浏览量"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uniqueUsers" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                    name="独立用户"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* 用户转化漏斗 */}
        <Card>
          <CardHeader>
            <CardTitle>用户转化路径分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  users: {
                    label: "用户数",
                    theme: {
                      light: "#ffc658",
                      dark: "#ffc658",
                    },
                  },
                  conversion: {
                    label: "转化率",
                    theme: {
                      light: "#ff7300",
                      dark: "#ff7300",
                    },
                  },
                }}
              >
                <BarChart data={userJourneyData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="step" type="category" width={100} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="#ffc658" name="用户数" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* 会话时长分布 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>用户会话时长分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  users: {
                    label: "用户数",
                    theme: {
                      light: "#8884d8",
                      dark: "#8884d8",
                    },
                  },
                  percentage: {
                    label: "占比",
                    theme: {
                      light: "#82ca9d",
                      dark: "#82ca9d",
                    },
                  },
                }}
              >
                <BarChart data={sessionDurationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="duration" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="#8884d8" name="用户数" />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="占比%"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
