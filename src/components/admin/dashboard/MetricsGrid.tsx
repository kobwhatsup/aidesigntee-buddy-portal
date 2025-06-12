
import { StatCard } from "./StatCard";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Target,
  UserPlus,
  Repeat,
  Mail,
  Eye,
  BarChart,
  TrendingDown
} from "lucide-react";
import { EnhancedStatsData } from "@/hooks/dashboard/useEnhancedStatsData";

interface MetricsGridProps {
  data: EnhancedStatsData | undefined;
  isLoading: boolean;
}

export function MetricsGrid({ data, isLoading }: MetricsGridProps) {
  const getStatsConfig = () => {
    if (!data) return [];
    
    return [
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
        title: "平均设计收益",
        value: data.avgDesignRevenue,
        icon: DollarSign,
        trend: 'neutral',
        prefix: "¥",
      },
      {
        title: "邮件转化率",
        value: data.emailConversionRate,
        icon: Target,
        trend: 'neutral',
        suffix: "%",
      },
    ];
  };

  const statsConfig = getStatsConfig();

  return (
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
  );
}
