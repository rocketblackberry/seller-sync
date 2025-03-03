import axios from "axios";
import { create } from "zustand";

type ExchangeRateStore = {
  exchangeRate: number;
  loading: boolean;
  error: string | null;
  fetchExchangeRate: () => Promise<void>;
};

export const useExchangeRateStore = create<ExchangeRateStore>((set) => ({
  exchangeRate: 0,
  loading: false,
  error: null,

  fetchExchangeRate: async () => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get<{ rate: number }>("/api/exchange");
      set({
        exchangeRate: data.rate,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: axios.isAxiosError(error)
          ? error.message
          : "為替レートの取得に失敗しました",
      });
    }
  },
}));
