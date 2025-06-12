
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Target,
  UserPlus,
  Repeat,
  Mail,
  Eye,
  BarChart,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedStatsData } from "@/hooks/dashboard/useEnhancedStatsData";

interface EnhancedStatsCardsProps {
  data: EnhancedStatsData | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
  prefix?: string;
  isLoading?: boolean;
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  trend = 'neutral',
  suffix = '',
  prefix = '',
  isLoading = false 
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toFixed(suffix === '%' ? 1 : 0);
    }
    return val;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{formatValue(value)}{suffix}
        </div>
        {change !== undefined && (
          <div className="flex items-center space-x-2 text-xs mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span
              className={cn(
                "font-medium",
                trend === 'up' && "text-green-600",
                trend === 'down' && "text-red-600",
                trend === 'neutral' && "text-gray-600"
              )}
            >
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EnhancedStatsCards({ data, isLoading, onRefresh }: EnhancedStatsCardsProps) {
  const statsConfig = data ? [
    {
      title: "总营收",
      value: data.totalRevenue,
      change: data.revenueGrowth,
      changeLabel: "vs 上期",
      icon: DollarSign,
      trend: data.revenueGrowth > 0 ? 'up' : data.revenueGrowth < 0 ? 'down' : 'neutral',
      prefix: "¥",
    },
    {
      title: "转化率",
      value: data.conversionRate,
      change: data.conversionRateChange,
      changeLabel: "vs 上期",
      icon: Target,
      trend: data.conversionRateChange > 0 ? 'up' : data.conversionRateChange < 0 ? 'down' : 'neutral',
      suffix: "%",
    },
    {
      title: "客单价",
      value: data.avgOrderValue,
      change: data.avgOrderValueChange,
      changeLabel: "vs 上期",
      icon: ShoppingCart,
      trend: data.avgOrderValueChange > 0 ? 'up' : data.avgOrderValueChange < 0 ? 'down' : 'neutral',
      prefix: "¥",
    },
    {
      title: "用户留存",
      value: data.customerRetention,
      change: data.retentionChange,
      changeLabel: "vs 上期",
      icon: Repeat,
      trend: data.retentionChange > 0 ? 'up' : data.retentionChange < 0 ? 'down' : 'neutral',
      suffix: "%",
    },
    {
      title: "总用户数",
      value: data.totalUsers,
      change: data.userGrowthRate,
      changeLabel: "增长率",
      icon: Users,
      trend: data.userGrowthRate > 0 ? 'up' : data.userGrowthRate < 0 ? 'down' : 'neutral',
    },
    {
      title: "新增用户",
      value: data.newUsers,
      icon: UserPlus,
      trend: 'neutral',
    },
    {
      title: "活跃用户",
      value: data.activeUsers,
      icon: Eye,
      trend: 'neutral',
    },
    {
      title: "订单总数",
      value: data.totalOrders,
      change: data.ordersGrowth,
      changeLabel: "vs 上期",
      icon: ShoppingCart,
      trend: data.ordersGrowth > 0 ? 'up' : data.ordersGrowth < 0 ? 'down' : 'neutral',
    },
    {
      title: "订单完成率",
      value: data.completionRate,
      icon: Target,
      trend: 'neutral',
      suffix: "%",
    },
    {
      title: "退款率",
      value: data.refundRate,
      icon: TrendingDown,
      trend: data.refundRate > 5 ? 'down' : 'neutral',
      suffix: "%",
    },
    {
      title: "设计稿数量",
      value: data.totalDesigns,
      change: data.designsGrowth,
      changeLabel: "vs 上期",
      icon: BarChart,
      trend: data.designsGrowth > 0 ? 'up' : data.designsGrowth < 0 ? 'down' : 'neutral',
    },
    {
      title: "设计使用率",
      value: data.designUsageRate,
      icon: Target,
      trend: 'neutral',
      suffix: "%",
    },
    {
      title: "邮件打开率",
      value: data.emailOpenRate,
      icon: Mail,
      trend: 'neutral',
      suffix: "%",
    },
    {
      title: "邮件点击率",
      value: data.emailClickRate,
      icon: Eye,
      trend: 'neutral',
      suffix: "%",
    },
    {
      title: "今日访客",
      value: data.todayVisitors,
      icon: Users,
      trend: 'neutral',
    },
    {
      title: "今日订单",
      value: data.realtimeOrders,
      icon: ShoppingCart,
      trend: 'neutral',
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">核心指标概览</h2>
          {data && (
            <p className="text-sm text-muted-foreground">
              最后更新: {data.lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 16 }).map((_, index) => (
            <StatCard
              key={index}
              title=""
              value=""
              icon={DollarSign}
              isLoading={true}
            />
          ))
        ) : (
          statsConfig.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeLabel={stat.changeLabel}
              icon={stat.icon}
              trend={stat.trend as 'up' | 'down' | 'neutral'}
              suffix={stat.suffix}
              prefix={stat.prefix}
            />
          ))
        )}
      </div>

      {/* 实时指标特殊区域 */}
      {data && !isLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse" />
            实时数据
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.onlineUsers}</div>
              <div className="text-sm text-muted-foreground">在线用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.todayVisitors}</div>
              <div className="text-sm text-muted-foreground">今日访客</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.realtimeOrders}</div>
              <div className="text-sm text-muted-foreground">今日订单</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
