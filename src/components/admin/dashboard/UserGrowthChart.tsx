import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendData } from "@/types/dashboard";

interface UserGrowthChartProps {
  data: TrendData[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">用户增长</h2>
      <div className="h-[300px]">
        <ChartContainer
          config={{
            users: {
              label: "新增用户",
              theme: {
                light: "#10b981",
                dark: "#34d399",
              },
            },
          }}
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="users"
              name="users"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}