
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface ABTestEditorProps {
  isOpen: boolean;
  onClose: () => void;
  test?: any;
  onSave: () => void;
}

export function ABTestEditor({ isOpen, onClose, test, onSave }: ABTestEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    test_type: 'subject_line',
    campaign_id: '',
    confidence_level: 95,
    start_date: '',
    end_date: '',
  });
  
  const [variants, setVariants] = useState([
    { variant_name: 'A', template_id: '', subject_line: '', traffic_percentage: 50 },
    { variant_name: 'B', template_id: '', subject_line: '', traffic_percentage: 50 },
  ]);

  const { toast } = useToast();

  // 获取邮件活动列表
  const { data: campaigns } = useQuery({
    queryKey: ['email-campaigns-for-ab'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('id, name')
        .eq('status', 'draft');
      if (error) throw error;
      return data;
    }
  });

  // 获取邮件模板列表
  const { data: templates } = useQuery({
    queryKey: ['email-templates-for-ab'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name || '',
        description: test.description || '',
        test_type: test.test_type || 'subject_line',
        campaign_id: test.campaign_id || '',
        confidence_level: test.confidence_level || 95,
        start_date: test.start_date ? new Date(test.start_date).toISOString().slice(0, 16) : '',
        end_date: test.end_date ? new Date(test.end_date).toISOString().slice(0, 16) : '',
      });
      
      if (test.email_ab_test_variants && test.email_ab_test_variants.length > 0) {
        setVariants(test.email_ab_test_variants.map((v: any) => ({
          variant_name: v.variant_name,
          template_id: v.template_id || '',
          subject_line: v.subject_line || '',
          traffic_percentage: v.traffic_percentage || 50,
        })));
      }
    } else {
      // 重置表单
      setFormData({
        name: '',
        description: '',
        test_type: 'subject_line',
        campaign_id: '',
        confidence_level: 95,
        start_date: '',
        end_date: '',
      });
      setVariants([
        { variant_name: 'A', template_id: '', subject_line: '', traffic_percentage: 50 },
        { variant_name: 'B', template_id: '', subject_line: '', traffic_percentage: 50 },
      ]);
    }
  }, [test, isOpen]);

  const addVariant = () => {
    const nextLetter = String.fromCharCode(65 + variants.length); // A, B, C, ...
    const remainingPercentage = 100 - variants.reduce((sum, v) => sum + v.traffic_percentage, 0);
    const newPercentage = Math.max(10, remainingPercentage);
    
    setVariants([...variants, {
      variant_name: nextLetter,
      template_id: '',
      subject_line: '',
      traffic_percentage: newPercentage,
    }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    
    // 如果是模板变化，自动填充主题行
    if (field === 'template_id' && templates) {
      const template = templates.find(t => t.id === value);
      if (template) {
        updated[index].subject_line = template.subject;
      }
    }
    
    setVariants(updated);
  };

  const handleSave = async () => {
    try {
      // 验证流量分配
      const totalTraffic = variants.reduce((sum, v) => sum + v.traffic_percentage, 0);
      if (Math.abs(totalTraffic - 100) > 0.01) {
        toast({
          title: "流量分配错误",
          description: "所有变体的流量分配总和必须等于100%",
          variant: "destructive",
        });
        return;
      }

      let testId = test?.id;

      if (test) {
        // 更新现有测试
        const { error } = await supabase
          .from('email_ab_tests')
          .update({
            name: formData.name,
            description: formData.description,
            test_type: formData.test_type,
            campaign_id: formData.campaign_id || null,
            confidence_level: formData.confidence_level,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          })
          .eq('id', test.id);

        if (error) throw error;
      } else {
        // 创建新测试
        const { data: newTest, error } = await supabase
          .from('email_ab_tests')
          .insert({
            name: formData.name,
            description: formData.description,
            test_type: formData.test_type,
            campaign_id: formData.campaign_id || null,
            confidence_level: formData.confidence_level,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          })
          .select()
          .single();

        if (error) throw error;
        testId = newTest.id;
      }

      // 删除现有变体
      if (test) {
        await supabase
          .from('email_ab_test_variants')
          .delete()
          .eq('test_id', test.id);
      }

      // 插入新变体
      const variantData = variants.map(variant => ({
        test_id: testId,
        variant_name: variant.variant_name,
        template_id: variant.template_id || null,
        subject_line: variant.subject_line,
        traffic_percentage: variant.traffic_percentage,
      }));

      const { error: variantError } = await supabase
        .from('email_ab_test_variants')
        .insert(variantData);

      if (variantError) throw variantError;

      toast({
        title: "保存成功",
        description: `A/B测试已${test ? '更新' : '创建'}`,
      });

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? '编辑' : '创建'}A/B测试</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">测试名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入A/B测试名称"
                />
              </div>
              
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述测试目标和预期结果"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test_type">测试类型</Label>
                  <Select
                    value={formData.test_type}
                    onValueChange={(value) => setFormData({ ...formData, test_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subject_line">主题行测试</SelectItem>
                      <SelectItem value="content">内容测试</SelectItem>
                      <SelectItem value="send_time">发送时间测试</SelectItem>
                      <SelectItem value="sender_name">发件人测试</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="campaign">关联活动</Label>
                  <Select
                    value={formData.campaign_id}
                    onValueChange={(value) => setFormData({ ...formData, campaign_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择邮件活动" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns?.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="confidence">置信度 (%)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="80"
                    max="99"
                    value={formData.confidence_level}
                    onChange={(e) => setFormData({ ...formData, confidence_level: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="start_date">开始时间</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">结束时间</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 测试变体 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>测试变体</CardTitle>
                <Button variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加变体
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">变体 {variant.variant_name}</h4>
                      {variants.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>邮件模板</Label>
                        <Select
                          value={variant.template_id}
                          onValueChange={(value) => updateVariant(index, 'template_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择模板" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>主题行</Label>
                        <Input
                          value={variant.subject_line}
                          onChange={(e) => updateVariant(index, 'subject_line', e.target.value)}
                          placeholder="邮件主题"
                        />
                      </div>
                      
                      <div>
                        <Label>流量分配 (%)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          value={variant.traffic_percentage}
                          onChange={(e) => updateVariant(index, 'traffic_percentage', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-sm text-gray-600">
                  总流量分配: {variants.reduce((sum, v) => sum + v.traffic_percentage, 0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {test ? '更新' : '创建'}测试
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
