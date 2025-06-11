
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// 页面导入
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import Users from "./pages/admin/Users";
import Designs from "./pages/admin/Designs";
import EmailMarketing from "./pages/admin/EmailMarketing";

// 布局导入
import { AdminLayout } from "./components/layout/AdminLayout";

const queryClient = new QueryClient();

// 路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/admin",
        element: <Dashboard />,
      },
      {
        path: "/admin/orders",
        element: <Orders />,
      },
      {
        path: "/admin/orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "/admin/users",
        element: <Users />,
      },
      {
        path: "/admin/designs",
        element: <Designs />,
      },
      {
        path: "/admin/email-marketing",
        element: <EmailMarketing />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  useEffect(() => {
    console.log("App mounted");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
