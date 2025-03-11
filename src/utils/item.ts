import { Item, ItemForm } from "@/types";

/**
 * ItemをItemFormに変換する
 */
export const itemToForm = (item: Item): ItemForm => ({
  id: item.id,
  seller_id: item.seller_id,
  keyword: item.keyword ?? "",
  title: item.title ?? "",
  image: item.image ?? "",
  condition: item.condition ?? "",
  description: item.description ?? "",
  description_ja: item.description_ja ?? "",
  url: item.url ?? "",
  price: item.price?.toString() ?? "0",
  cost: item.cost?.toString() ?? "0",
  weight: item.weight?.toString() ?? "0",
  freight: item.freight?.toString() ?? "0",
  profit: item.profit?.toString() ?? "0",
  profit_rate: item.profit_rate?.toString() ?? "0",
  fvf_rate: item.fvf_rate?.toString() ?? "0",
  promote_rate: item.promote_rate?.toString() ?? "0",
  stock: item.stock?.toString() ?? "0",
  status: item.status ?? "",
});

/**
 * ItemFormをItemに変換する
 */
export const formToItem = (form: ItemForm): Item => ({
  id: form.id,
  seller_id: form.seller_id,
  keyword: form.keyword,
  title: form.title,
  image: form.image,
  condition: form.condition,
  description: form.description,
  description_ja: form.description_ja,
  url: form.url,
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
