import { ScrapeItemResponse } from "@/app/api/supplier/scrape-item/route";
import { DEFAULT_ITEM } from "@/constants";
import { Item } from "@/types";
import axios from "axios";
import { create } from "zustand";

type ScrapedItem = {
  data: Item;
  error?: string;
};

type ItemStore = {
  currentItem: Item;
  loading: boolean;
  error: string | null;
  fetchItem: (id: string) => Promise<Item | undefined>;
  initItem: (sellerId: number) => void;
  updateItem: (item: Item) => Promise<Item | undefined>;
  scrapeItem: (id: string) => Promise<ScrapedItem | undefined>;
  exportItem: (seller: string, id: string) => Promise<Item | undefined>;
};

export const useItemStore = create<ItemStore>((set) => ({
  currentItem: DEFAULT_ITEM,
  loading: false,
  error: null,

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
      const { data } = await axios.post<Item>("/api/items", item);
      set({ currentItem: data, loading: false });
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

  scrapeItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ id });
      const {
        data: { error },
      } = await axios.get<ScrapeItemResponse>("/api/supplier/scrape-item", {
        params,
      });
      const { data } = await axios.get<Item>(`/api/items/${id}`);
      set({ currentItem: data, loading: false });
      return { data, error };
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.message
          : "アイテムの更新に失敗しました",
        loading: false,
      });
    }
  },

  exportItem: async (seller: string, id: string) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ seller, id });
      const { data } = await axios.get<Item>("/api/ebay/export", { params });
      set({ loading: false });
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
}));
