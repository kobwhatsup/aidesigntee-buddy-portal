import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TimeRange } from "@/types/dashboard";

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  customDateRange: { from: Date; to: Date };
  onTimeRangeChange: (value: TimeRange) => void;
  onCustomDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export function TimeRangeSelector({
  timeRange,
  customDateRange,
  onTimeRangeChange,
  onCustomDateRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">今日</SelectItem>
          <SelectItem value="yesterday">昨日</SelectItem>
          <SelectItem value="this_month">本月</SelectItem>
          <SelectItem value="last_month">上月</SelectItem>
          <SelectItem value="this_year">今年</SelectItem>
          <SelectItem value="custom">自定义</SelectItem>
        </SelectContent>
      </Select>

      {timeRange === 'custom' && (
        <DateRangePicker
          from={customDateRange.from}
          to={customDateRange.to}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onCustomDateRangeChange({ from: range.from, to: range.to });
            }
          }}
        />
      )}
    </div>
  );
}