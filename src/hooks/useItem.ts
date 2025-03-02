import { DEFAULT_ITEM } from "@/constants";
import { Item, SearchCondition } from "@/types";
import axios from "axios";
import { useCallback, useState } from "react";

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
  const [item, setItem] = useState<Item>(DEFAULT_ITEM);

  /**
   * セラーIDと検索条件に基づいてアイテム一覧を取得する
   * @param sellerId セラーID
   * @param searchCondition 検索条件オブジェクト
   */
  const fetchItems = useCallback(
    async (sellerId: number, searchCondition: SearchCondition) => {
      try {
        const { keyword, status } = searchCondition;
        const params = new URLSearchParams({
          sellerId: sellerId.toString(),
          ...(keyword && { keyword }),
          ...(status && { status }),
        });

        const { data } = await axios.get<Item[]>(`/api/items?${params}`);
        setItems(data);
      } catch (error) {
        console.error(
          "Error fetching items:",
          axios.isAxiosError(error) ? error.message : error,
        );
      }
    },
    [],
  );

  /**
   * 指定したアイテムIDの詳細を取得し、選択中のアイテムに設定する
   * @param id 取得するアイテムのID
   */
  const fetchItem = useCallback(async (id: string) => {
    try {
      const { data } = await axios.get<Item>(`/api/items/${id}`);
      setItem(data);
      return data;
    } catch (error) {
      console.error(
        "Error fetching item:",
        axios.isAxiosError(error) ? error.message : error,
      );
    }
  }, []);

  /**
   * 選択中のアイテムを初期化する
   */
  const initItem = (sellerId: number) => {
    setItem({ ...DEFAULT_ITEM, seller_id: sellerId });
  };

  /**
   * アイテムを追加更新する
   * @param updatedItem 追加更新するアイテムのオブジェクト
   */
  const updateItem = useCallback(async (item: Item) => {
    try {
      const { data } = await axios.post<Item>("/api/items/", item);
      setItems((prevItems) =>
        prevItems.map((it) => (it.id === data.id ? data : it)),
      );
      setItem(data);
      return data;
    } catch (error) {
      console.error(
        "Error updating item:",
        axios.isAxiosError(error) ? error.message : error,
      );
    }
  }, []);

  /**
   * アイテムを削除する
   * @param id 削除するアイテムのID
   */
  const deleteItem = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/items/${id}`);
      setItems((prevItems) => prevItems.filter((it) => it.id !== id));
      setItem((prevItem) =>
        prevItem && prevItem.id === id ? DEFAULT_ITEM : prevItem,
      );
    } catch (error) {
      console.error(
        "Error deleting item:",
        axios.isAxiosError(error) ? error.message : error,
      );
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
