import { Item, SearchCondition, SortDirection } from "@/types";
import axios from "axios";
import { create } from "zustand";

type ItemsStore = {
  items: Item[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    availableItems: number;
    notAvailableItems: number;
    itemsPerPage: number;
  };
  fetchItems: (
    sellerId: number,
    condition: SearchCondition,
    sort?: string,
    order?: SortDirection,
    page?: number,
    itemsPerPage?: number,
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItemInList: (item: Item) => void;
};

export const useItemsStore = create<ItemsStore>((set) => ({
  items: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    availableItems: 0,
    notAvailableItems: 0,
    itemsPerPage: 50, // デフォルト値
  },

  fetchItems: async (
    sellerId: number,
    condition: SearchCondition,
    sort: string = "updated_at",
    order: SortDirection = "descending",
    page: number = 1,
    itemsPerPage: number = 50,
  ) => {
    set({ loading: true, error: null });
    try {
      const { keyword, status } = condition;
      const params = new URLSearchParams({
        sellerId: sellerId.toString(),
        sort,
        order,
        page: page.toString(),
        itemsPerPage: itemsPerPage.toString(),
        ...(keyword && { keyword }),
        ...(status && { status }),
      });

      const response = await axios.get<{
        items: Item[];
        totalItems: number;
        availableItems: number;
        notAvailableItems: number;
        totalPages: number;
      }>("/api/items", { params });

      set({
        items: response.data.items,
        pagination: {
          currentPage: page,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          availableItems: response.data.availableItems,
          notAvailableItems: response.data.notAvailableItems,
          itemsPerPage,
        },
        loading: false,
      });
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
