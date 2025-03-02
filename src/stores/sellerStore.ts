import { Seller } from "@/types";
import axios from "axios";
import { create } from "zustand";

type SellerStore = {
  sellersCache: { [key: string]: Seller[] };
  sellers: Seller[];
  selectedSellerId: number;
  loading: boolean;
  error: string | null;
  fetchSellers: (sub: string) => void;
  selectSeller: (id: number) => void;
};

export const useSellerStore = create<SellerStore>((set) => ({
  sellersCache: {},
  sellers: [],
  selectedSellerId: 0,
  loading: true,
  error: null,
  fetchSellers: async (sub: string) => {
    if (useSellerStore.getState().sellersCache[sub]) {
      set({
        sellers: useSellerStore.getState().sellersCache[sub],
        loading: false,
        error: null,
      });
      return;
    }

    try {
      const { data } = await axios.get<Seller[]>("/api/sellers");
      set({
        sellers: data,
        loading: false,
        error: null,
      });
      useSellerStore.setState({
        sellersCache: {
          ...useSellerStore.getState().sellersCache,
          [sub]: data,
        },
      });
    } catch (error) {
      set({
        loading: false,
        error: axios.isAxiosError(error)
          ? error.message
          : "セラー情報の取得に失敗しました",
      });
    }
  },
  selectSeller: (id: number) => {
    set({ selectedSellerId: id });
    localStorage.setItem("sellerId", String(id));
  },
}));
