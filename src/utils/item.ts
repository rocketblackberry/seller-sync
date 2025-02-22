import { Item, ItemForm } from "@/types";

/**
 * ItemをItemFormに変換する
 */
export const itemToForm = (item: Item): ItemForm => ({
  id: item.id,
  seller_id: item.seller_id,
  item_id: item.item_id,
  keyword: item.keyword,
  title: item.title,
  condition: item.condition,
  description: item.description,
  description_ja: item.description_ja,
  supplier_url: item.supplier_url,
  price: item.price.toString(),
  cost: item.cost.toString(),
  weight: item.weight.toString(),
  freight: item.freight.toString(),
  profit: item.profit.toString(),
  profit_rate: item.profit_rate.toString(),
  fvf_rate: item.fvf_rate.toString(),
  promote_rate: item.promote_rate.toString(),
  stock: item.stock.toString(),
  status: item.status,
});

/**
 * ItemFormをItemに変換する
 */
export const formToItem = (form: ItemForm): Item => ({
  id: form.id,
  seller_id: form.seller_id,
  item_id: form.item_id,
  keyword: form.keyword,
  title: form.title,
  condition: form.condition,
  description: form.description,
  description_ja: form.description_ja,
  supplier_url: form.supplier_url,
  price: parseFloat(form.price),
  cost: parseFloat(form.cost),
  weight: parseFloat(form.weight),
  freight: parseFloat(form.freight),
  profit: parseFloat(form.profit),
  profit_rate: parseFloat(form.profit_rate),
  fvf_rate: parseFloat(form.fvf_rate),
  promote_rate: parseFloat(form.promote_rate),
  stock: parseInt(form.stock),
  status: form.status,
});

/**
 * ListingStatusをシステムのステータスに変換する
 */
export const convertStatus = (status: string): string | undefined => {
  switch (status) {
    case "Active":
      return "active";
    case "Completed":
      return "deleted";
    case "Custom":
      return "deleted";
    case "CustomCode":
      return "deleted";
    case "Ended":
      return "deleted";
    default:
      return undefined;
  }
};

/**
 * ConditionIDをシステムのコンディションに変換する
 */
export const convertCondition = (id: string): string | undefined => {
  switch (id) {
    case "1000":
      return "new";
    case "3000":
      return "used";
    default:
      return undefined;
  }
};
