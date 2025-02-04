import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import { TimeRange } from "@/types/dashboard";

export const useTimeRange = (timeRange: TimeRange, customDateRange: { from: Date; to: Date }) => {
  const getTimeRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        return { 
          start: startOfDay(subDays(now, 1)), 
          end: endOfDay(subDays(now, 1)) 
        };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month':
        return { 
          start: startOfMonth(subMonths(now, 1)), 
          end: endOfMonth(subMonths(now, 1)) 
        };
      case 'this_year':
        return { start: startOfYear(now), end: now };
      case 'custom':
        return { 
          start: startOfDay(customDateRange.from), 
          end: endOfDay(customDateRange.to) 
        };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  return getTimeRange();
};