import { Card } from "@/components/ui/card";
import { ChartBar, Users, ShoppingCart, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      name: "总用户数",
      value: "1,234",
      icon: Users,
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "总订单数",
      value: "456",
      icon: ShoppingCart,
      change: "+8%",
      changeType: "increase",
    },
    {
      name: "待审核设计",
      value: "23",
      icon: CheckCircle,
      change: "-5",
      changeType: "decrease",
    },
    {
      name: "本月销售额",
      value: "¥12,345",
      icon: ChartBar,
      change: "+23%",
      changeType: "increase",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据概览</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {stat.change}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}