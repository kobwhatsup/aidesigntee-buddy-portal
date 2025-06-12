
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Variable, 
  Plus, 
  Copy, 
  User, 
  ShoppingCart,
  Package,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VariableManagerProps {
  variables?: Record<string, string>;
}

export function VariableManager({ variables = {} }: VariableManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // 预定义的变量类别
  const variableCategories = [
    {
      title: "用户信息",
      icon: <User className="h-4 w-4" />,
      variables: [
        { key: "username", label: "用户名", example: "张先生" },
        { key: "email", label: "邮箱地址", example: "user@example.com" },
        { key: "first_name", label: "名字", example: "三" },
        { key: "last_name", label: "姓氏", example: "张" },
        { key: "phone", label: "手机号", example: "138****8888" },
      ]
    },
    {
      title: "网站链接",
      icon: <Package className="h-4 w-4" />,
      variables: [
        { key: "website_url", label: "网站首页", example: "https://aidesigntee.com" },
        { key: "design_url", label: "设计页面", example: "https://aidesigntee.com/design" },
        { key: "shop_url", label: "商店页面", example: "https://aidesigntee.com/shop" },
        { key: "dashboard_url", label: "用户面板", example: "https://aidesigntee.com/dashboard" },
        { key: "cart_url", label: "购物车", example: "https://aidesigntee.com/cart" },
      ]
    },
    {
      title: "产品信息",
      icon: <ShoppingCart className="h-4 w-4" />,
      variables: [
        { key: "product_name", label: "产品名称", example: "经典款T恤" },
        { key: "design_title", label: "设计标题", example: "创意图案设计" },
        { key: "size", label: "尺寸", example: "L" },
        { key: "color", label: "颜色", example: "白色" },
        { key: "price", label: "价格", example: "99" },
        { key: "quantity", label: "数量", example: "1" },
      ]
    },
    {
      title: "订单信息",
      icon: <Calendar className="h-4 w-4" />,
      variables: [
        { key: "order_number", label: "订单号", example: "T202412110001" },
        { key: "order_date", label: "订单日期", example: "2024-12-11" },
        { key: "total_amount", label: "订单总额", example: "99" },
        { key: "shipping_address", label: "收货地址", example: "北京市朝阳区xxx街道xxx号" },
        { key: "tracking_number", label: "快递单号", example: "SF1234567890" },
      ]
    }
  ];

  // 复制变量到剪贴板
  const copyVariable = (key: string) => {
    const variableText = `{{${key}}}`;
    navigator.clipboard.writeText(variableText);
    toast({
      title: "已复制",
      description: `变量 ${variableText} 已复制到剪贴板`,
    });
  };

  // 过滤变量
  const filteredCategories = variableCategories.map(category => ({
    ...category,
    variables: category.variables.filter(variable =>
      variable.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.key.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.variables.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Variable className="h-5 w-5" />
          动态变量
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="搜索变量..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-gray-500">
            点击变量名复制，然后粘贴到邮件内容中
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-blue-600">{category.icon}</div>
                <h4 className="font-medium text-sm text-gray-700">{category.title}</h4>
              </div>
              
              <div className="space-y-1 pl-6">
                {category.variables.map((variable) => (
                  <div
                    key={variable.key}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer group"
                    onClick={() => copyVariable(variable.key)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {`{{${variable.key}}}`}
                        </Badge>
                        <span className="text-sm text-gray-600 truncate">
                          {variable.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        示例: {variable.example}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && searchTerm && (
          <div className="text-center py-4 text-gray-500 text-sm">
            未找到匹配的变量
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 使用说明：</p>
            <p>• 在邮件内容中使用 {`{{变量名}}`} 格式</p>
            <p>• 发送时系统会自动替换为实际值</p>
            <p>• 支持HTML和纯文本模式</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
