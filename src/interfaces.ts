/** 検索条件 */
export interface SearchCondition {
  keyword: string;
  status: string;
}

/** 商品 */
export interface Item {
  id: number;
  item_id: string;
  keyword: string;
  title: string;
  image: string;
  condition: string;
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
  status: string;
  view: number;
  watch: number;
  sold: number;
  created_at: Date;
  updated_at: Date;
}

/** 商品フォーム */
export interface ItemForm {
  id?: number;
  item_id: string;
  keyword: string;
  title: string;
  condition: string;
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
  status: string;
}

/** スクレイピング結果 */
export interface ScrapingResult {
  title?: string;
  price: number;
  stock: number;
  size?: number;
  error?: string;
}
