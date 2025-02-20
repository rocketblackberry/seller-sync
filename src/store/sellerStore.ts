import { Seller } from "@/interfaces";
import axios from "axios";
import { create } from "zustand";

type SellerStore = {
  sellersCache: { [key: string]: Seller[] };
  sellers: Seller[];
  selectedSellerId: number;
  loading: boolean;
  error: string;
  fetchSellers: (sub: string) => void;
  selectSeller: (id: number) => void;
};

export const useSellerStore = create<SellerStore>((set) => ({
  sellersCache: {},
  sellers: [],
  selectedSellerId: 0,
  loading: true,
  error: "",
  fetchSellers: async (sub: string) => {
    if (useSellerStore.getState().sellersCache[sub]) {
      set({
        sellers: useSellerStore.getState().sellersCache[sub],
        loading: false,
      });
      return;
    }
    try {
      const response = await axios.get("/api/sellers");
      const data: Seller[] = response.data;
      set({ sellers: data, loading: false });
      useSellerStore.setState({
        sellersCache: {
          ...useSellerStore.getState().sellersCache,
          [sub]: data,
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  selectSeller: (id: number) => {
    set({ selectedSellerId: id });
    localStorage.setItem("sellerId", String(id));
  },
}));
