
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts";
import { TrendData } from "@/types/dashboard";

interface AdvancedChartsProps {
  trendsData: TrendData[];
  isLoading: boolean;
}

// 示例数据
const conversionFunnelData = [
  { name: '访问', value: 1000, fill: '#8884d8' },
  { name: '浏览商品', value: 600, fill: '#83a6ed' },
  { name: '加入购物车', value: 300, fill: '#8dd1e1' },
  { name: '开始结账', value: 150, fill: '#82ca9d' },
  { name: '完成支付', value: 75, fill: '#a4de6c' },
];

const deviceData = [
  { name: '移动端', value: 65, fill: '#0088FE' },
  { name: '桌面端', value: 30, fill: '#00C49F' },
  { name: '平板', value: 5, fill: '#FFBB28' },
];

const regionData = [
  { name: '北京', orders: 120, revenue: 15000 },
  { name: '上海', orders: 98, revenue: 12000 },
  { name: '广州', orders: 86, revenue: 11000 },
  { name: '深圳', orders: 76, revenue: 9500 },
  { name: '杭州', orders: 65, revenue: 8000 },
  { name: '成都', orders: 54, revenue: 6500 },
];

const productCategoryData = [
  { name: '经典款', value: 40, fill: '#8884d8' },
  { name: '潮流款', value: 30, fill: '#82ca9d' },
  { name: '运动款', value: 20, fill: '#ffc658' },
  { name: '限定款', value: 10, fill: '#ff7300' },
];

const userValueData = [
  { segment: '高价值用户', users: 150, revenue: 25000, fill: '#8884d8' },
  { segment: '中价值用户', users: 300, revenue: 15000, fill: '#82ca9d' },
  { segment: '低价值用户', users: 450, revenue: 8000, fill: '#ffc658' },
  { segment: '新用户', users: 200, revenue: 3000, fill: '#ff7300' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdvancedCharts({ trendsData, isLoading }: AdvancedChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">高级数据分析</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 销售额与订单量双轴图 */}
        <Card>
          <CardHeader>
            <CardTitle>销售额与订单量趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  sales: {
                    label: "销售额",
                    theme: {
                      light: "#8884d8",
                      dark: "#8884d8",
                    },
                  },
                  orders: {
                    label: "订单量",
                    theme: {
                      light: "#82ca9d",
                      dark: "#82ca9d",
                    },
                  },
                }}
              >
                <ComposedChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="销售额" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="订单量"
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* 转化漏斗图 */}
        <Card>
          <CardHeader>
            <CardTitle>用户转化漏斗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionFunnelData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {conversionFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 设备使用分布 */}
        <Card>
          <CardHeader>
            <CardTitle>设备使用分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 地域订单分布 */}
        <Card>
          <CardHeader>
            <CardTitle>地域订单分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  orders: {
                    label: "订单数",
                    theme: {
                      light: "#8884d8",
                      dark: "#8884d8",
                    },
                  },
                  revenue: {
                    label: "收入",
                    theme: {
                      light: "#82ca9d",
                      dark: "#82ca9d",
                    },
                  },
                }}
              >
                <ComposedChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="订单数" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="收入"
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* 产品类别销售占比 */}
        <Card>
          <CardHeader>
            <CardTitle>产品类别销售占比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={productCategoryData}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  <Tooltip />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 用户价值分布 */}
        <Card>
          <CardHeader>
            <CardTitle>用户价值分布</CardTitle>
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
                  revenue: {
                    label: "贡献收入",
                    theme: {
                      light: "#82ca9d",
                      dark: "#82ca9d",
                    },
                  },
                }}
              >
                <ComposedChart data={userValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="users" fill="#8884d8" name="用户数" />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="贡献收入"
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
