import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">AIDESIGNTEE</h1>
        <p className="text-xl text-gray-600 mb-8">AI驱动的T恤设计平台</p>
        
        <div className="space-x-4">
          <Button asChild>
            <Link to="/admin" className="bg-blue-600 hover:bg-blue-700">
              进入后台管理
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;