import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Orders() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单管理</h1>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单编号</TableHead>
              <TableHead>客户名称</TableHead>
              <TableHead>订单金额</TableHead>
              <TableHead>订单状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>ORD001</TableCell>
              <TableCell>张三</TableCell>
              <TableCell>¥299</TableCell>
              <TableCell>待发货</TableCell>
              <TableCell>2024-03-20</TableCell>
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