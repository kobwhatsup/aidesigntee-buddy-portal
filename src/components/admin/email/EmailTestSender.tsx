
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

interface EmailTestSenderProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  subject: string;
  htmlContent: string;
  variables?: Record<string, string>;
}

interface TestFormData {
  testEmail: string;
  [key: string]: string; // 用于动态变量
}

export function EmailTestSender({ 
  isOpen, 
  onClose, 
  templateId,
  subject, 
  htmlContent,
  variables = {}
}: EmailTestSenderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { register, handleSubmit, watch, reset } = useForm<TestFormData>({
    defaultValues: {
      testEmail: '',
      ...Object.keys(variables).reduce((acc, key) => ({
        ...acc,
        [key]: variables[key] || ''
      }), {})
    }
  });

  // 从HTML内容中提取变量占位符
  const extractVariables = (content: string) => {
    const regex = /{{[\s]*([^}]+?)[\s]*}}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }
    // 也检查subject中的变量
    const subjectRegex = /{{[\s]*([^}]+?)[\s]*}}/g;
    let subjectMatch;
    while ((subjectMatch = subjectRegex.exec(subject)) !== null) {
      matches.push(subjectMatch[1].trim());
    }
    return [...new Set(matches)]; // 去重
  };

  const detectedVariables = extractVariables(htmlContent + ' ' + subject);

  const onSubmit = async (data: TestFormData) => {
    setIsLoading(true);
    try {
      // 收集变量值
      const variablesToSend: Record<string, string> = {};
      detectedVariables.forEach(variable => {
        variablesToSend[variable] = data[variable] || variables[variable] || `{{${variable}}}`;
      });

      const { data: result, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          templateId,
          testEmail: data.testEmail,
          subject,
          htmlContent,
          variables: variablesToSend
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "测试邮件已发送",
        description: `邮件已成功发送到 ${data.testEmail}`,
      });

      reset();
      onClose();
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "发送失败",
        description: error.message || "发送测试邮件时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            发送测试邮件
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">收件人邮箱</Label>
            <Input
              id="testEmail"
              {...register('testEmail', { 
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              })}
              placeholder="输入测试邮箱地址"
              type="email"
            />
          </div>

          {detectedVariables.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">变量设置</Label>
              <div className="space-y-2">
                {detectedVariables.map((variable) => (
                  <div key={variable} className="space-y-1">
                    <Label htmlFor={variable} className="text-xs text-gray-600">
                      {variable}
                    </Label>
                    <Input
                      id={variable}
                      {...register(variable)}
                      placeholder={variables[variable] || `输入 ${variable} 的值`}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>邮件主题:</strong> {subject}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              将发送到指定邮箱进行预览测试
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  发送测试
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
