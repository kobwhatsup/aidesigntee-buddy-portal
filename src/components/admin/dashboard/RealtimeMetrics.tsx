
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, ShoppingCart } from "lucide-react";
import { useRealTimeStats } from "@/hooks/useRealTimeStats";

export function RealtimeMetrics() {
  const { onlineUsers, todayVisitors, realtimeOrders, isLoading } = useRealTimeStats();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse" />
            实时数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold mb-4 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse" />
          实时数据
          <Badge variant="secondary" className="ml-2 text-xs">
            真实数据
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-2xl font-bold text-blue-600">{onlineUsers}</div>
            </div>
            <div className="text-sm text-muted-foreground">在线用户</div>
            <div className="text-xs text-muted-foreground mt-1">
              5分钟内活跃
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(onlineUsers / 100 * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-2xl font-bold text-green-600">{todayVisitors}</div>
            </div>
            <div className="text-sm text-muted-foreground">今日访客</div>
            <div className="text-xs text-muted-foreground mt-1">
              独立访客数
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(todayVisitors / 1000 * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="text-center group">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-5 w-5 text-purple-600 mr-2" />
              <div className="text-2xl font-bold text-purple-600">{realtimeOrders}</div>
            </div>
            <div className="text-sm text-muted-foreground">今日订单</div>
            <div className="text-xs text-muted-foreground mt-1">
              所有状态订单
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(realtimeOrders / 50 * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
