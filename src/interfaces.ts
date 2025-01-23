export interface Item {
  id: number;
  itemId: string;
  keyword: string;
  title: string;
  image: string;
  condition: string;
  description: string;
  descriptionJa: string;
  supplierUrl: string;
  price: number;
  cost: number;
  weight: number;
  freight: number;
  profit: number;
  profitRate: number;
  fvfRate: number;
  promoteRate: number;
  stock: number;
  status: string;
  view: number;
  watch: number;
  sold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemDB {
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

export interface ItemField {
  id: string;
  itemId: string;
  keyword: string;
  title: string;
  condition: string;
  description: string;
  descriptionJa: string;
  supplierUrl: string;
  price: string;
  cost: string;
  weight: string;
  freight: string;
  profit: string;
  profitRate: string;
  fvfRate: string;
  promoteRate: string;
  stock: string;
  status: string;
}
