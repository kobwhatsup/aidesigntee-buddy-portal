import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChartBar, ShoppingCart, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "数据概览", href: "/admin", icon: ChartBar },
  { name: "订单管理", href: "/admin/orders", icon: ShoppingCart },
  { name: "用户管理", href: "/admin/users", icon: Users },
  { name: "设计审核", href: "/admin/designs", icon: CheckCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">AIDESIGNTEE 后台</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">关闭侧边栏</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-4 h-6 w-6",
                    isActive
                      ? "text-gray-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 主内容区 */}
      <div
        className={cn(
          "lg:pl-64 flex flex-col min-h-screen transition-all duration-200",
          !sidebarOpen && "lg:pl-0"
        )}
      >
        <header className="bg-white shadow-sm lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <span className="sr-only">打开侧边栏</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}