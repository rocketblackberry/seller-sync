import { DEFAULT_ITEM } from "@/constants";
import { Item, SearchCondition } from "@/types";
import axios from "axios";
import { create } from "zustand";

type ItemStore = {
  items: Item[];
  currentItem: Item;
  loading: boolean;
  error: string | null;
  fetchItems: (
    sellerId: number,
    searchCondition: SearchCondition,
  ) => Promise<void>;
  fetchItem: (id: string) => Promise<Item | undefined>;
  initItem: (sellerId: number) => void;
  updateItem: (item: Item) => Promise<Item | undefined>;
  deleteItem: (id: string) => Promise<void>;
};

export const useItemStore = create<ItemStore>((set) => ({
  items: [],
  currentItem: DEFAULT_ITEM,
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

  fetchItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get<Item>(`/api/items/${id}`);
      set({ currentItem: data, loading: false });
      return data;
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.message
          : "アイテムの取得に失敗しました",
        loading: false,
      });
    }
  },

  initItem: (sellerId: number) => {
    set({ currentItem: { ...DEFAULT_ITEM, seller_id: sellerId } });
  },

  updateItem: async (item: Item) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post<Item>("/api/items/", item);
      set((state) => ({
        items: state.items.map((it) => (it.id === data.id ? data : it)),
        currentItem: data,
        loading: false,
      }));
      return data;
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.message
          : "アイテムの更新に失敗しました",
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
        currentItem:
          state.currentItem.id === id ? DEFAULT_ITEM : state.currentItem,
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
}));
