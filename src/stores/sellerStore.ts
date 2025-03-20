import { Seller } from "@/types";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SellerStore = {
  sellers: Seller[];
  selectedSellerId: number;
  selectedSeller: Seller | undefined;
  loading: boolean;
  error: string | null;
  fetchSellers: () => void;
  selectSeller: (id: number) => void;
};

export const useSellerStore = create<SellerStore>()(
  persist(
    (set, get) => ({
      sellers: [],
      selectedSellerId: 0,
      selectedSeller: undefined,
      loading: true,
      error: null,

      fetchSellers: async () => {
        try {
          const { data } = await axios.get<Seller[]>("/api/sellers");
          const currentState = get();

          set({
            sellers: data,
            loading: false,
            error: null,
            ...(!currentState.selectedSeller &&
              data.length > 0 && {
                selectedSellerId: Number(data[0].id),
                selectedSeller: data[0],
              }),
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
        const seller = get().sellers.find((seller) => Number(seller.id) === id);
        set({ selectedSellerId: id, selectedSeller: seller });
      },
    }),
    {
      name: "seller",
    },
  ),
);
