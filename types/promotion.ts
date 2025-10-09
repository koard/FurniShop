export type Promotion = {
  id: string;
  name: string;
  code: string;
  discountPct?: number;
  discountAmt?: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  usageLimit?: number;
  usageCount?: number;
  applicableCategories?: string[];
};
