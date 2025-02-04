import { UserPlus, Package, DollarSign, ShoppingCart, ChartBar, Users } from "lucide-react";
import { StatItem } from "@/types/dashboard";

export const getStatsConfig = (statsData: any): StatItem[] => [
  {
    name: "新增用户",
    value: statsData?.newUsers?.toString() || "0",
    icon: UserPlus,
    change: "+23%",
    changeType: "increase",
  },
  {
    name: "用户总数",
    value: statsData?.totalUsers?.toString() || "0",
    icon: Users,
    change: `活跃: ${statsData?.activeUsers || 0}`,
    changeType: "neutral",
  },
  {
    name: "订单总数",
    value: statsData?.totalOrders?.toString() || "0",
    icon: Package,
    change: statsData?.completedOrders ? `已完成: ${statsData.completedOrders}` : "0",
    changeType: "neutral",
  },
  {
    name: "销售额",
    value: statsData?.totalSales ? `¥${statsData.totalSales.toFixed(2)}` : "¥0",
    icon: DollarSign,
    change: `平均订单: ¥${(statsData?.avgOrderValue || 0).toFixed(2)}`,
    changeType: "increase",
  },
  {
    name: "购物车商品",
    value: statsData?.cartItems?.toString() || "0",
    icon: ShoppingCart,
    change: "待结算",
    changeType: "neutral",
  },
  {
    name: "设计稿数量",
    value: statsData?.designs?.toString() || "0",
    icon: ChartBar,
    change: "新增",
    changeType: "neutral",
  }
];