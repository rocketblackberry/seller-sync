import { Item } from "./types";

/** Seller Hub */
export const EBAY_EDIT_URL =
  "https://www.ebay.com/sl/list?mode=ReviseItem&itemId=$1";

/** コンディション */
export const CONDITION_OPTIONS = [
  { label: "新品", value: "new" },
  { label: "中古", value: "used" },
] as const;

/** 仕入先 */
export const SUPPLIER_OPTIONS = [
  {
    label: "Google",
    value: "google",
    url: "https://www.google.com/search?q=$1",
    color: "bg-google",
  },
  {
    label: "Amazon",
    value: "amazon",
    url: "https://www.amazon.co.jp/s?k=$1",
    color: "bg-amazon",
  },
  {
    label: "メルカリ",
    value: "mercari",
    url: "https://jp.mercari.com/search?keyword=$1&status=on_sale&sort=price&order=asc",
    color: "bg-mercari",
  },
  {
    label: "Yahoo!",
    value: "yahoo",
    url: "https://auctions.yahoo.co.jp/search/search?p=$1&va=$1&is_postage_mode=1&dest_pref_code=14&exflg=1&b=1&n=50&s1=tbidorbuy&o1=a",
    color: "bg-yahoo",
  },
] as const;

/** 仕入先ドメイン */
export const SUPPLIER_DOMAINS = {
  amazon: ["https://www.amazon.co.jp/"],
  mercari: ["https://jp.mercari.com/item/"],
  mercariShop: ["https://jp.mercari.com/shops/product/"],
  yahooAuction: ["https://page.auctions.yahoo.co.jp/"],
  yahooFleaMarket: ["https://paypayfleamarket.yahoo.co.jp"],
  yahooShopping: ["https://store.shopping.yahoo.co.jp/"],
  yodobashi: ["https://www.yodobashi.com/"],
  biccamera: ["https://www.biccamera.com/"],
} as const;

/** デフォルト商品 */
export const DEFAULT_ITEM: Item = {
  id: "",
  seller_id: 0,
  keyword: "",
  title: "",
  image: "",
  condition: "used",
  description: "",
  description_ja: "",
  url: "",
  price: 0,
  cost: 0,
  weight: 1.0,
  freight: 0,
  profit: 0,
  profit_rate: 10.0,
  fvf_rate: 13.0,
  promote_rate: 2.0,
  stock: 1,
  status: "inactive",
  scrape_error: 0,
  imported_at: null,
  scraped_at: null,
  synced_at: null,
  created_at: null,
  updated_at: null,
};

/** シッピングポリシー */
export const SHIPPING_POLICY_OPTIONS = [
  { label: "Expedited 0〜1500", value: "expedited_1500" },
  { label: "Expedited 1501〜3500", value: "expedited_3500" },
  { label: "Expedited 3501〜5000", value: "expedited_5000" },
  { label: "Expedited USA", value: "expedited_usa" },
] as const;

/** 送料（Fedex International Connect Plus / アメリカ） */
export const SHIPPING_PRICE_LIST = [
  { weight: 0.5, price: 2016 },
  { weight: 1.0, price: 2478 },
  { weight: 1.5, price: 2707 },
  { weight: 2.0, price: 2963 },
  { weight: 2.5, price: 3224 },
  { weight: 3.0, price: 3374 },
  { weight: 3.5, price: 3424 },
  { weight: 4.0, price: 3833 },
  { weight: 4.5, price: 4242 },
  { weight: 5.0, price: 4652 },
  { weight: 5.5, price: 5648 },
  { weight: 6.0, price: 5828 },
  { weight: 6.5, price: 6009 },
  { weight: 7.0, price: 6189 },
  { weight: 7.5, price: 6369 },
  { weight: 8.0, price: 6549 },
  { weight: 8.5, price: 6729 },
  { weight: 9.0, price: 6910 },
  { weight: 9.5, price: 8450 },
  { weight: 10.0, price: 8665 },
] as const;

/** 燃料サーチャージ率 */
export const FUEL_SURCHARGE_RATE = 30;

/** ステータス */
export const STATUS_OPTIONS = [
  { label: "アクティブ", value: "active" },
  { label: "ドラフト", value: "inactive" },
  { label: "終了", value: "deleted" },
] as const;
