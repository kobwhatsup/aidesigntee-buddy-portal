import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatItem } from "@/types/dashboard";

interface StatsCardProps {
  stat: StatItem;
}

export function StatsCard({ stat }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <stat.icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{stat.name}</p>
          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          <p
            className={cn(
              "text-sm",
              stat.changeType === "increase"
                ? "text-green-600"
                : stat.changeType === "decrease"
                ? "text-red-600"
                : "text-gray-600"
            )}
          >
            {stat.change}
          </p>
        </div>
      </div>
    </Card>
  );
}