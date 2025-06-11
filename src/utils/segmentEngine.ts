
export interface SegmentCondition {
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

export interface SegmentRule {
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
}

export class SegmentEngine {
  static buildQuery(conditions: any): string {
    if (!conditions || typeof conditions !== 'object') {
      return 'true';
    }

    const parts: string[] = [];

    // 处理注册时间条件
    if (conditions.created_after) {
      parts.push(`profiles.created_at >= '${conditions.created_after}'`);
    }

    if (conditions.created_before) {
      parts.push(`profiles.created_at <= '${conditions.created_before}'`);
    }

    // 处理订单相关条件
    if (conditions.has_orders !== undefined) {
      if (conditions.has_orders) {
        parts.push(`EXISTS (SELECT 1 FROM orders WHERE orders.user_id = profiles.id)`);
      } else {
        parts.push(`NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = profiles.id)`);
      }
    }

    if (conditions.min_order_amount) {
      parts.push(`EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.user_id = profiles.id 
        AND orders.total_amount >= ${conditions.min_order_amount}
      )`);
    }

    if (conditions.order_count_min) {
      parts.push(`(
        SELECT COUNT(*) FROM orders 
        WHERE orders.user_id = profiles.id
      ) >= ${conditions.order_count_min}`);
    }

    // 处理设计相关条件
    if (conditions.has_designs !== undefined) {
      if (conditions.has_designs) {
        parts.push(`EXISTS (SELECT 1 FROM design_drafts WHERE design_drafts.user_id = profiles.id)`);
      } else {
        parts.push(`NOT EXISTS (SELECT 1 FROM design_drafts WHERE design_drafts.user_id = profiles.id)`);
      }
    }

    if (conditions.design_count_min) {
      parts.push(`(
        SELECT COUNT(*) FROM design_drafts 
        WHERE design_drafts.user_id = profiles.id
      ) >= ${conditions.design_count_min}`);
    }

    return parts.length > 0 ? parts.join(' AND ') : 'true';
  }

  static getPresetConditions() {
    return {
      new_users: {
        name: '新用户（30天内注册）',
        conditions: {
          created_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          has_orders: false
        }
      },
      active_buyers: {
        name: '活跃买家（有订单）',
        conditions: {
          has_orders: true,
          order_count_min: 1
        }
      },
      high_value_customers: {
        name: '高价值客户（订单金额>200）',
        conditions: {
          has_orders: true,
          min_order_amount: 200
        }
      },
      designers: {
        name: '设计师用户',
        conditions: {
          has_designs: true,
          design_count_min: 1
        }
      },
      inactive_users: {
        name: '非活跃用户（无订单的老用户）',
        conditions: {
          created_before: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          has_orders: false
        }
      }
    };
  }
}
