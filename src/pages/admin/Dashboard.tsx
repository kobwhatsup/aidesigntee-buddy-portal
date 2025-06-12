
import { useState } from "react";
import { TimeRangeSelector } from "@/components/admin/dashboard/TimeRangeSelector";
import { EnhancedStatsCards } from "@/components/admin/dashboard/EnhancedStatsCards";
import { AdvancedCharts } from "@/components/admin/dashboard/AdvancedCharts";
import { UserBehaviorAnalysis } from "@/components/admin/dashboard/UserBehaviorAnalysis";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { UserGrowthChart } from "@/components/admin/dashboard/UserGrowthChart";
import { OrderStatusChart } from "@/components/admin/dashboard/OrderStatusChart";
import { TimeRange } from "@/types/dashboard";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { useEnhancedStatsData } from "@/hooks/dashboard/useEnhancedStatsData";
import { useTimeRange } from "@/hooks/dashboard/useTimeRange";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [customDateRange, setCustomDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  const range = useTimeRange(timeRange, customDateRange);
  const { trendsData, isLoading: isTrendsLoading } = useDashboard(timeRange, customDateRange);
  const { 
    data: enhancedStatsData, 
    isLoading: isStatsLoading, 
    refetch: refetchStats 
  } = useEnhancedStatsData(range);

  const isLoading = isStatsLoading || isTrendsLoading;

  const handleRefresh = () => {
    refetchStats();
  };

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">核心指标</TabsTrigger>
          <TabsTrigger value="behavior">用户行为</TabsTrigger>
          <TabsTrigger value="advanced">高级分析</TabsTrigger>
          <TabsTrigger value="legacy">传统视图</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedStatsCards 
            data={enhancedStatsData} 
            isLoading={isStatsLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <UserBehaviorAnalysis isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedCharts 
            trendsData={trendsData?.trends || []} 
            isLoading={isTrendsLoading}
          />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
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
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SalesChart data={trendsData?.trends || []} />
              <UserGrowthChart data={trendsData?.trends || []} />
              <OrderStatusChart data={trendsData?.orderStatus || []} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
