import { useState } from "react";
import { TimeRangeSelector } from "@/components/admin/dashboard/TimeRangeSelector";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { UserGrowthChart } from "@/components/admin/dashboard/UserGrowthChart";
import { OrderStatusChart } from "@/components/admin/dashboard/OrderStatusChart";
import { TimeRange } from "@/types/dashboard";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { getStatsConfig } from "@/config/dashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [customDateRange, setCustomDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  const { statsData, trendsData, isLoading } = useDashboard(timeRange, customDateRange);
  const stats = getStatsConfig(statsData);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="p-6 rounded-lg border">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="p-6 rounded-lg border">
            <Skeleton className="h-[300px]" />
          </div>
          <div className="p-6 rounded-lg border">
            <Skeleton className="h-[300px]" />
          </div>
          <div className="p-6 rounded-lg border">
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    );
  }

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