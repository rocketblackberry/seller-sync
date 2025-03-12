export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

export const columns: Column[] = [
  { key: "image", label: "画像" },
  { key: "id", label: "ID", sortable: true },
  { key: "title", label: "タイトル", sortable: true },
  { key: "price", label: "売値", sortable: true },
  { key: "cost", label: "仕入値", sortable: true },
  { key: "weight", label: "重量", sortable: true },
  { key: "profit", label: "利益", sortable: true },
  { key: "profit_rate", label: "利益率", sortable: true },
  { key: "stock", label: "在庫数", sortable: true },
  { key: "error", label: "エラー", sortable: true },
  { key: "imported_at", label: "取得日", sortable: true },
  { key: "scraped_at", label: "調査日", sortable: true },
  { key: "synced_at", label: "同期日", sortable: true },
];
