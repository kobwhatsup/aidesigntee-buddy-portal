import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Users() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">用户管理</h1>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>订单数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>USR001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>2024-03-01</TableCell>
              <TableCell>5</TableCell>
              <TableCell>正常</TableCell>
              <TableCell>
                <button className="text-blue-600 hover:text-blue-800">
                  查看详情
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}