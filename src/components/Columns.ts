export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

export const columns: Column[] = [
  { key: "image", label: "画像" },
  { key: "id", label: "ID", sortable: true },
  { key: "title", label: "タイトル", sortable: true },
  { key: "url", label: "仕入先", sortable: true, align: "center" },
  { key: "price", label: "売値", sortable: true, align: "right" },
  { key: "cost", label: "仕入値", sortable: true, align: "right" },
  { key: "weight", label: "重量", sortable: true, align: "right" },
  { key: "profit", label: "利益", sortable: true, align: "right" },
  { key: "profit_rate", label: "利益率", sortable: true, align: "right" },
  { key: "stock", label: "在庫数", sortable: true, align: "right" },
  { key: "scrape_error", label: "エラー", sortable: true, align: "right" },
  { key: "imported_at", label: "取得日", sortable: true },
  { key: "scraped_at", label: "調査日", sortable: true },
  { key: "synced_at", label: "同期日", sortable: true },
];
