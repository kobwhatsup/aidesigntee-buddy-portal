
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShippingFormProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SHIPPING_COMPANIES = [
  { id: "sf", name: "顺丰快递" },
  { id: "ems", name: "EMS" },
] as const;

export function ShippingForm({ orderId, isOpen, onClose, onSuccess }: ShippingFormProps) {
  const [shippingCompany, setShippingCompany] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingCompany || !trackingNumber) {
      toast({
        title: "请填写完整信息",
        description: "物流公司和运单号不能为空",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCompany = SHIPPING_COMPANIES.find(
        (company) => company.id === shippingCompany
      );

      const { error } = await supabase
        .from("orders")
        .update({
          status: "shipped",
          shipping_company: selectedCompany?.name,
          tracking_number: trackingNumber,
          shipped_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "发货成功",
        description: "订单状态已更新",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "发货失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>填写发货信息</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipping-company">物流公司</Label>
            <Select
              value={shippingCompany}
              onValueChange={setShippingCompany}
            >
              <SelectTrigger id="shipping-company">
                <SelectValue placeholder="请选择物流公司" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_COMPANIES.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-number">运单号</Label>
            <Input
              id="tracking-number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="请输入运单号"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "提交中..." : "确认发货"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
