import { Status } from "./common";

/** コンディション */
export type Condition = "new" | "used";

/** 検索条件 */
export interface SearchCondition {
  keyword: string;
  status: Status;
}

/** 商品 */
export interface Item {
  id: number;
  seller_id: number;
  item_id: string;
  keyword: string;
  title: string;
  image?: string;
  condition: Condition;
  description: string;
  description_ja: string;
  supplier_url: string;
  price: number;
  cost: number;
  weight: number;
  freight: number;
  profit: number;
  profit_rate: number;
  fvf_rate: number;
  promote_rate: number;
  stock: number;
  status: Status;
  view?: number;
  watch?: number;
  sold?: number;
  created_at?: Date;
  updated_at?: Date;
}

/** 商品フォーム */
export interface ItemForm {
  id: number;
  seller_id: number;
  item_id: string;
  keyword: string;
  title: string;
  condition: Condition;
  description: string;
  description_ja: string;
  supplier_url: string;
  price: string;
  cost: string;
  weight: string;
  freight: string;
  profit: string;
  profit_rate: string;
  fvf_rate: string;
  promote_rate: string;
  stock: string;
  status: Status;
}

export interface EbayItem {
  ItemID?: string;
  Title?: string;
  PictureDetails?: {
    PictureURL?: string | string[];
  };
  ConditionID?: string;
  Quantity?: string;
  SellingStatus?: {
    ListingStatus?: string;
  };
}

export interface MappedItem {
  id: string;
  title: string;
  image: string;
  condition: string;
  convertedCondition: string;
  stock: string;
  status: string;
  convertedStatus: string;
}
