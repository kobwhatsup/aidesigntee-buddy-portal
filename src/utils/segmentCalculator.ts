
import { supabase } from "@/integrations/supabase/client";
import { SegmentEngine } from "./segmentEngine";

export class SegmentCalculator {
  static async calculateSegmentUserCount(segmentId: string): Promise<number> {
    try {
      // 获取分群信息
      const { data: segment, error: segmentError } = await supabase
        .from('user_segments')
        .select('conditions')
        .eq('id', segmentId)
        .single();

      if (segmentError) throw segmentError;

      // 构建查询条件
      const query = SegmentEngine.buildQuery(segment.conditions);

      // 计算用户数量
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or(query);

      if (error) throw error;

      // 更新分群用户数量
      await supabase
        .from('user_segments')
        .update({ user_count: count || 0 })
        .eq('id', segmentId);

      return count || 0;
    } catch (error) {
      console.error('计算分群用户数量失败:', error);
      return 0;
    }
  }

  static async updateAllSegmentCounts(): Promise<void> {
    try {
      // 获取所有动态分群
      const { data: segments, error } = await supabase
        .from('user_segments')
        .select('id')
        .eq('is_dynamic', true);

      if (error) throw error;

      // 更新每个分群的用户数量
      const updatePromises = segments.map(segment => 
        this.calculateSegmentUserCount(segment.id)
      );

      await Promise.all(updatePromises);
      console.log('所有分群用户数量更新完成');
    } catch (error) {
      console.error('批量更新分群用户数量失败:', error);
    }
  }
}
