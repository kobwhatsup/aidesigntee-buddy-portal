
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedStatsData } from "@/hooks/dashboard/useEnhancedStatsData";
import { MetricsGrid } from "./MetricsGrid";
import { RealtimeMetrics } from "./RealtimeMetrics";

interface EnhancedStatsCardsProps {
  data: EnhancedStatsData | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export function EnhancedStatsCards({ data, isLoading, onRefresh }: EnhancedStatsCardsProps) {
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

      <MetricsGrid data={data} isLoading={isLoading} />

      {/* 实时指标区域 */}
      <RealtimeMetrics
        onlineUsers={data?.onlineUsers || 0}
        todayVisitors={data?.todayVisitors || 0}
        realtimeOrders={data?.realtimeOrders || 0}
        isLoading={isLoading}
      />
    </div>
  );
}
