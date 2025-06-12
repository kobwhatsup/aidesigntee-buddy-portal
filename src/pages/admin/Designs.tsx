
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Designs() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // 模拟设计数据 - 实际项目中应该从数据库获取
  const mockDesigns = [
    {
      id: "DSG001",
      designer: "designer123",
      title: "夏日海滩主题T恤",
      status: "pending",
      submitTime: "2024-03-20T10:00:00Z",
      preview: "/placeholder.svg"
    },
    {
      id: "DSG002", 
      designer: "artist456",
      title: "极简几何图案",
      status: "approved",
      submitTime: "2024-03-19T15:30:00Z",
      preview: "/placeholder.svg"
    },
    {
      id: "DSG003",
      designer: "creative789",
      title: "复古摇滚风格",
      status: "rejected",
      submitTime: "2024-03-18T09:15:00Z",
      preview: "/placeholder.svg"
    }
  ];

  // 格式化设计状态
  const formatDesignStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      revision: '需修改'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDesigns = mockDesigns.filter(design => 
    design.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.designer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (designId: string) => {
    toast({
      title: "设计已通过",
      description: `设计 ${designId} 已成功通过审核`,
    });
  };

  const handleReject = (designId: string) => {
    toast({
      title: "设计已拒绝",
      description: `设计 ${designId} 已被拒绝`,
      variant: "destructive",
    });
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">设计审核</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="搜索设计ID、设计师或标题"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white border-gray-300 text-gray-900"
            />
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            筛选
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-900 font-semibold">设计ID</TableHead>
              <TableHead className="text-gray-900 font-semibold">设计师</TableHead>
              <TableHead className="text-gray-900 font-semibold">设计标题</TableHead>
              <TableHead className="text-gray-900 font-semibold">提交时间</TableHead>
              <TableHead className="text-gray-900 font-semibold">预览图</TableHead>
              <TableHead className="text-gray-900 font-semibold">状态</TableHead>
              <TableHead className="text-gray-900 font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDesigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-900">
                  暂无设计数据
                </TableCell>
              </TableRow>
            ) : (
              filteredDesigns.map((design) => (
                <TableRow key={design.id} className="hover:bg-gray-50">
                  <TableCell className="text-gray-900 font-medium">{design.id}</TableCell>
                  <TableCell className="text-gray-900">{design.designer}</TableCell>
                  <TableCell className="text-gray-900">{design.title}</TableCell>
                  <TableCell className="text-gray-900">
                    {format(new Date(design.submitTime), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <img
                      src={design.preview}
                      alt="设计预览"
                      className="h-10 w-10 object-cover rounded border border-gray-200"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(design.status)} border-0`}>
                      {formatDesignStatus(design.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {design.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprove(design.id)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReject(design.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
