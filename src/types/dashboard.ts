export type TimeRange = 'today' | 'yesterday' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export type ChangeType = 'increase' | 'decrease' | 'neutral';

export type StatItem = {
  name: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: ChangeType;
};

export type TrendData = {
  date: string;
  sales: number;
  users: number;
};

export type OrderStatusData = {
  name: string;
  value: number;
};