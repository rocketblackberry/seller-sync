import { Item, SearchCondition } from "@/types";
import axios from "axios";
import { create } from "zustand";

type ItemsStore = {
  items: Item[];
  loading: boolean;
  error: string | null;
  fetchItems: (
    sellerId: number,
    searchCondition: SearchCondition,
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItemInList: (item: Item) => void;
};

export const useItemsStore = create<ItemsStore>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async (sellerId: number, searchCondition: SearchCondition) => {
    set({ loading: true, error: null });
    try {
      const { keyword, status } = searchCondition;
      const params = new URLSearchParams({
        sellerId: sellerId.toString(),
        ...(keyword && { keyword }),
        ...(status && { status }),
      });

      const { data } = await axios.get<Item[]>(`/api/items?${params}`);
      set({ items: data, loading: false });
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.message
          : "アイテムの取得に失敗しました",
        loading: false,
      });
    }
  },

  deleteItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/items/${id}`);
      set((state) => ({
        items: state.items.filter((it) => it.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.message
          : "アイテムの削除に失敗しました",
        loading: false,
      });
    }
  },

  updateItemInList: (updatedItem: Item) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    }));
  },
}));
