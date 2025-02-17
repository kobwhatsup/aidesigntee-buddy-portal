import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { ChartBar, ShoppingCart, Users, CheckCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
const navigation = [{
  name: "数据概览",
  href: "/admin",
  icon: ChartBar
}, {
  name: "订单管理",
  href: "/admin/orders",
  icon: ShoppingCart
}, {
  name: "用户管理",
  href: "/admin/users",
  icon: Users
}, {
  name: "设计审核",
  href: "/admin/designs",
  icon: CheckCircle
}];
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // 检查管理员权限
  const {
    data: adminUser,
    isLoading
  } = useQuery({
    queryKey: ['admin-auth'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');
      const {
        data: adminData,
        error: adminError
      } = await supabase.from('admin_users').select('*').eq('user_id', user.id).single();
      if (adminError || !adminData) {
        throw new Error('没有管理员权限');
      }
      return adminData;
    }
  });
  useEffect(() => {
    if (!isLoading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, isLoading, navigate]);
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "已退出登录",
        description: "期待您的再次访问！"
      });
      navigate('/admin/login');
    } catch (error: any) {
      toast({
        title: "退出失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">加载中...</p>
        </div>
      </div>;
  }
  if (!adminUser) {
    return null;
  }
  return <div className="min-h-screen bg-gray-100">
      <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out", !sidebarOpen && "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold text-sky-600">AIDESIGNTEE 管理后台</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100">
            <span className="sr-only">关闭侧边栏</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {navigation.map(item => {
          const isActive = location.pathname === item.href;
          return <Link key={item.name} to={item.href} className={cn("group flex items-center px-2 py-2 text-base font-medium rounded-md", isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                <item.icon className={cn("mr-4 h-6 w-6", isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500")} />
                {item.name}
              </Link>;
        })}
          
          <button onClick={handleLogout} className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50">
            <LogOut className="mr-4 h-6 w-6" />
            退出登录
          </button>
        </nav>
      </div>

      <div className={cn("lg:pl-64 flex flex-col min-h-screen transition-all duration-200", !sidebarOpen && "lg:pl-0")}>
        <header className="bg-white shadow-sm lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-900">
              <span className="sr-only">打开侧边栏</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>;
}