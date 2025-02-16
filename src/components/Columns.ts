export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export const columns: Column[] = [
  { key: "image", label: "写真", width: "200px" },
  { key: "title", label: "タイトル", sortable: true, width: "500px" },
  { key: "price", label: "売値", sortable: true, width: "50px" },
  { key: "cost", label: "仕入値", sortable: true, width: "50px" },
  { key: "freight", label: "送料", sortable: true, width: "50px" },
  { key: "profit", label: "利益", sortable: true, width: "50px" },
  { key: "profit_rate", label: "利益率", sortable: true, width: "50px" },
  { key: "stock", label: "在庫数", sortable: true, width: "50px" },
  { key: "view", label: "閲覧数", sortable: true, width: "50px" },
  { key: "watch", label: "ウォッチ数", sortable: true, width: "50px" },
  { key: "sold", label: "販売数", sortable: true, width: "50px" },
  { key: "updated_at", label: "更新日時", sortable: true, width: "200px" },
  { key: "action", label: "削除", width: "50px" },
];
