import { SearchCondition } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SearchConditionStore = {
  condition: SearchCondition;
  updateCondition: (newCondition: Partial<SearchCondition>) => void;
  resetCondition: () => void;
};

const DEFAULT_CONDITION: SearchCondition = {
  keyword: "",
  status: "active",
};

export const useSearchConditionStore = create<SearchConditionStore>()(
  persist(
    (set) => ({
      condition: DEFAULT_CONDITION,

      updateCondition: (newCondition) =>
        set((state) => ({
          condition: { ...state.condition, ...newCondition },
        })),

      resetCondition: () => set({ condition: DEFAULT_CONDITION }),
    }),
    {
      name: "searchCondition",
    },
  ),
);
