
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplates } from "@/components/admin/email/EmailTemplates";
import { EmailCampaigns } from "@/components/admin/email/EmailCampaigns";
import { UserSegments } from "@/components/admin/email/UserSegments";
import { EmailAnalytics } from "@/components/admin/email/EmailAnalytics";

export default function EmailMarketing() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">邮件营销</h1>
        <p className="text-gray-600 mt-2">管理邮件模板、营销活动和用户分群</p>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">营销活动</TabsTrigger>
          <TabsTrigger value="templates">邮件模板</TabsTrigger>
          <TabsTrigger value="segments">用户分群</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <EmailCampaigns />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="segments">
          <UserSegments />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
