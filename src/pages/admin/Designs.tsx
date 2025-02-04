import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Designs() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">设计审核</h1>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>设计ID</TableHead>
              <TableHead>设计师</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>预览图</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>DSG001</TableCell>
              <TableCell>designer123</TableCell>
              <TableCell>2024-03-20</TableCell>
              <TableCell>
                <img
                  src="/placeholder.svg"
                  alt="设计预览"
                  className="h-10 w-10 object-cover rounded"
                />
              </TableCell>
              <TableCell>待审核</TableCell>
              <TableCell>
                <button className="text-blue-600 hover:text-blue-800 mr-2">
                  查看详情
                </button>
                <button className="text-green-600 hover:text-green-800">
                  通过
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}