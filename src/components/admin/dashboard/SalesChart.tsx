import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendData } from "@/types/dashboard";

interface SalesChartProps {
  data: TrendData[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">销售趋势</h2>
      <div className="h-[300px]">
        <ChartContainer
          config={{
            sales: {
              label: "销售额",
              theme: {
                light: "#0ea5e9",
                dark: "#38bdf8",
              },
            },
          }}
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="sales"
              name="sales"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}