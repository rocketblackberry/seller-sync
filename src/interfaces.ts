type Spec = {
  name: string;
  value: string;
};

export interface IItem {
  id: number;
  item_id: string;
  source_item_id: string;
  maker: string;
  series: string;
  name: string;
  title: string;
  description: string;
  images: string[];
  condition: string;
  condition_description: string;
  category_id: string;
  specs: Spec[];
  price: number;
  stock: number;
  supplier: string;
  supplier_url: string;
  cost: number;
  weight: number;
  freight: number;
  shipping_policy: string;
  promote: number;
  status: string;
  view: number;
  watch: number;
  sold: number;
  selected: boolean;
  created_at?: Date;
  updated_at?: Date;
  synced_at?: Date;
}

export interface IItem2 {
  id: number;
  item_id: string;
  keyword: string;
  title: string;
  image: string;
  condition: string;
  condition_description: string;
  price: number;
  stock: number;
  cost: number;
  weight: number;
  freight: number;
  promote: number;
  supplier_url: string;
  status: string;
  view: number;
  watch: number;
  sold: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface SubItem {
  id: string;
  item_id: string;
  keyword: string;
  price: string;
  cost: string;
  weight: string;
  freight: string;
  profit: string;
  margin: string;
  url: string;
  description_ja: string;
  description_en: string;
}

export interface ISupplier {
  label: string;
  value: string;
  url: string;
  color: string;
}
