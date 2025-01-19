type Spec = {
  name: string;
  value: string;
};

export interface Item {
  id: number;
  ebay_id: string;
  source_ebay_id: string;
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
