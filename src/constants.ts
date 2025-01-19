export const CONDITION = {
  NEW: "new",
  USED: "used",
} as const;

export const SUPPLIER = {
  AMAZON: "amazon",
  MERCARI: "mercari",
  MERCARI_SHOP: "mercari_shop",
  YAHOO_AUCTION: "yahoo_auction",
  YAHOO_SHOP: "yahoo_shop",
  RAKUTEN: "rakuten",
} as const;

export const SHIPPING_POLICY = {
  EXPEDITED_1500: "expedited_1500",
  EXPEDITED_3500: "expedited_3500",
  EXPEDITED_5000: "expedited_5000",
  EXPEDITED_USA: "expedited_usa",
} as const;

export const SHIPPING_PRICE_LIST = [
  { weight: 500, price: 2016 },
  { weight: 1000, price: 2478 },
  { weight: 1500, price: 2707 },
  { weight: 2000, price: 2963 },
  { weight: 2500, price: 3224 },
  { weight: 3000, price: 3374 },
  { weight: 3500, price: 3424 },
  { weight: 4000, price: 3833 },
  { weight: 4500, price: 4242 },
  { weight: 5000, price: 4652 },
  { weight: 5500, price: 5648 },
  { weight: 6000, price: 5828 },
  { weight: 6500, price: 6009 },
  { weight: 7000, price: 6189 },
  { weight: 7500, price: 6369 },
  { weight: 8000, price: 6549 },
  { weight: 8500, price: 6729 },
  { weight: 9000, price: 6910 },
  { weight: 9500, price: 8450 },
  { weight: 10000, price: 8665 },
] as const;

export const FUEL_SURCHARGE_RATE = 0.3;

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DRAFT: "draft",
  DELETED: "deleted",
} as const;

export const STATUS_NAME = {
  ACTIVE: "アクティブ",
  INACTIVE: "非アクティブ",
  DRAFT: "ドラフト",
  DELETED: "削除済み",
} as const;

export type ConditionType = (typeof CONDITION)[keyof typeof CONDITION];
export type SupplierType = (typeof SUPPLIER)[keyof typeof SUPPLIER];
export type ShippingPolicyType =
  (typeof SHIPPING_POLICY)[keyof typeof SHIPPING_POLICY];
export type StatusType = (typeof STATUS)[keyof typeof STATUS];
