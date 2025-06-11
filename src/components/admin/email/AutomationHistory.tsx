
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface AutomationHistoryProps {
  ruleId: string;
  onClose: () => void;
}

export function AutomationHistory({ ruleId, onClose }: AutomationHistoryProps) {
  const { data: executions, isLoading } = useQuery({
    queryKey: ['automation-executions', ruleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_automation_executions')
        .select(`
          *,
          email_automation_rules(name)
        `)
        .eq('rule_id', ruleId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'executing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'completed': { variant: 'default' as const, label: '已完成' },
      'failed': { variant: 'destructive' as const, label: '失败' },
      'pending': { variant: 'secondary' as const, label: '等待中' },
      'executing': { variant: 'outline' as const, label: '执行中' },
      'cancelled': { variant: 'outline' as const, label: '已取消' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return '-';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = endTime - startTime;
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}min`;
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center p-8">加载中...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            自动化执行历史 - {executions?.[0]?.email_automation_rules?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 统计概览 */}
          <div className="grid grid-cols-5 gap-4">
            {['completed', 'failed', 'pending', 'executing', 'cancelled'].map(status => {
              const count = executions?.filter(e => e.execution_status === status).length || 0;
              const statusConfig = getStatusBadge(status);
              
              return (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600">{statusConfig.label}</div>
                </div>
              );
            })}
          </div>

          {/* 执行记录表格 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>状态</TableHead>
                  <TableHead>用户ID</TableHead>
                  <TableHead>触发事件</TableHead>
                  <TableHead>计划执行时间</TableHead>
                  <TableHead>实际执行时间</TableHead>
                  <TableHead>完成时间</TableHead>
                  <TableHead>执行时长</TableHead>
                  <TableHead>错误信息</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions?.map((execution) => {
                  const statusConfig = getStatusBadge(execution.execution_status);
                  
                  return (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.execution_status)}
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-mono text-xs">
                        {execution.user_id ? execution.user_id.slice(0, 8) + '...' : '-'}
                      </TableCell>
                      
                      <TableCell>
                        {execution.trigger_event ? (
                          <div className="text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(execution.trigger_event, null, 2)}
                            </pre>
                          </div>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell>
                        {execution.scheduled_at 
                          ? format(new Date(execution.scheduled_at), 'MM-dd HH:mm:ss')
                          : '-'
                        }
                      </TableCell>
                      
                      <TableCell>
                        {execution.executed_at 
                          ? format(new Date(execution.executed_at), 'MM-dd HH:mm:ss')
                          : '-'
                        }
                      </TableCell>
                      
                      <TableCell>
                        {execution.completed_at 
                          ? format(new Date(execution.completed_at), 'MM-dd HH:mm:ss')
                          : '-'
                        }
                      </TableCell>
                      
                      <TableCell>
                        {execution.executed_at && execution.completed_at
                          ? formatDuration(execution.executed_at, execution.completed_at)
                          : '-'
                        }
                      </TableCell>
                      
                      <TableCell>
                        {execution.error_message && (
                          <div className="text-xs text-red-600 max-w-xs truncate" title={execution.error_message}>
                            {execution.error_message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {executions?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无执行记录
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
