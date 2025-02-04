import { useState } from "react";
import { TimeRangeSelector } from "@/components/admin/dashboard/TimeRangeSelector";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { UserGrowthChart } from "@/components/admin/dashboard/UserGrowthChart";
import { OrderStatusChart } from "@/components/admin/dashboard/OrderStatusChart";
import { TimeRange } from "@/types/dashboard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getStatsConfig } from "@/config/dashboardStats";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [customDateRange, setCustomDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  const { statsData, trendsData } = useDashboardData(timeRange, customDateRange);
  const stats = getStatsConfig(statsData);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        <TimeRangeSelector
          timeRange={timeRange}
          customDateRange={customDateRange}
          onTimeRangeChange={setTimeRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart data={trendsData?.trends || []} />
        <UserGrowthChart data={trendsData?.trends || []} />
        <OrderStatusChart data={trendsData?.orderStatus || []} />
      </div>
    </div>
  );
}