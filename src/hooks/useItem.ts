import { FVF_RATE, PROMOTE_RATE } from "@/constants";
import { Item, SearchCondition } from "@/interfaces";
import { useCallback, useState } from "react";

const defaultItem: Item = {
  id: 0,
  seller_id: 0,
  item_id: "",
  keyword: "",
  title: "",
  condition: "used",
  description: "",
  description_ja: "",
  supplier_url: "",
  price: 0,
  cost: 0,
  weight: 1.0,
  freight: 0,
  profit: 0,
  profit_rate: 10.0,
  fvf_rate: FVF_RATE,
  promote_rate: PROMOTE_RATE,
  stock: 1,
  status: "draft",
};

/**
 * useItem カスタムフック
 *
 * - アイテム一覧(items)と選択中のアイテム(item)の状態管理
 * - セラーIDと検索条件を用いてアイテム一覧を取得する fetchItems
 * - アイテムIDから単一のアイテムを取得する fetchItem
 * - アイテムを更新する updateItem
 * - アイテムを削除する deleteItem
 *
 * @returns {Object} items, item, fetchItems, fetchItem, updateItem, deleteItem
 */
export default function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item>(defaultItem);

  /**
   * セラーIDと検索条件に基づいてアイテム一覧を取得する
   * @param sellerId セラーID
   * @param searchCondition 検索条件オブジェクト
   */
  const fetchItems = useCallback(
    async (sellerId: number, searchCondition: SearchCondition) => {
      try {
        const params: string[] = [`sellerId=${sellerId}`];
        const { keyword, status } = searchCondition;
        if (keyword) {
          params.push(`keyword=${encodeURIComponent(keyword)}`);
        }
        if (status) {
          params.push(`status=${encodeURIComponent(status)}`);
        }
        const url = `/api/items${params.length ? "?" + params.join("&") : ""}`;
        const response = await fetch(url);
        const data: Item[] = await response.json();
        setItems(data);
      } catch (e) {
        console.error("Error fetching items:", e);
      }
    },
    [],
  );

  /**
   * 指定したアイテムIDの詳細を取得し、選択中のアイテムに設定する
   * @param id 取得するアイテムのID
   */
  const fetchItem = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/items/${id}`);
      const data: Item = await response.json();
      setItem(data);
      return data;
    } catch (e) {
      console.error("Error fetching item:", e);
    }
  }, []);

  /**
   * 選択中のアイテムを初期化する
   */
  const initItem = () => {
    setItem(defaultItem);
  };

  /**
   * アイテムを追加更新する
   * @param updatedItem 追加更新するアイテムのオブジェクト
   */
  const updateItem = useCallback(async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error("Failed to update item");
      }
      const data: Item = await response.json();
      setItems((prevItems) =>
        prevItems.map((it) => (it.id === data.id ? data : it)),
      );
      setItem(data);
      return data;
    } catch (e) {
      console.error("Error updating item:", e);
    }
  }, []);

  /**
   * アイテムを削除する
   * @param id 削除するアイテムのID
   */
  const deleteItem = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      setItems((prevItems) => prevItems.filter((it) => it.id !== id));
      setItem((prevItem) =>
        prevItem && prevItem.id === id ? defaultItem : prevItem,
      );
    } catch (e) {
      console.error("Error deleting item:", e);
    }
  }, []);

  return {
    items,
    item,
    fetchItems,
    fetchItem,
    initItem,
    updateItem,
    deleteItem,
  };
}
