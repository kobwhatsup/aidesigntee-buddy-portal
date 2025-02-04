import { TimeRange } from "@/types/dashboard";
import { useTimeRange } from "./useTimeRange";
import { useStatsData } from "./useStatsData";
import { useTrendsData } from "./useTrendsData";

export const useDashboard = (timeRange: TimeRange, customDateRange: { from: Date; to: Date }) => {
  const range = useTimeRange(timeRange, customDateRange);
  const { data: statsData, isLoading: isStatsLoading } = useStatsData(range);
  const { data: trendsData, isLoading: isTrendsLoading } = useTrendsData(range);

  return {
    statsData,
    trendsData,
    isLoading: isStatsLoading || isTrendsLoading
  };
};