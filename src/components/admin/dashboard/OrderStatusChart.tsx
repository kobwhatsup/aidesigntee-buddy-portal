import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { OrderStatusData } from "@/types/dashboard";

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">订单状态分布</h2>
      <div className="h-[300px] flex items-center justify-center">
        <ChartContainer
          config={{
            status: {
              label: "订单状态",
              theme: {
                light: "#8884d8",
                dark: "#8884d8",
              },
            },
          }}
        >
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-600">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}