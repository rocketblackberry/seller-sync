import { SearchCondition } from "@/interfaces";
import { useCallback, useState } from "react";

const STORAGE_KEY = "searchCondition";

/**
 * useSearchCondition フック
 *
 * ローカルストレージと同期した検索条件の状態管理を行います。
 * 初期値はローカルストレージに保存されている値が利用され、なければデフォルト値が使われます。
 *
 * @returns {Object} searchCondition, updateSearchCondition のオブジェクト
 */
export default function useSearchCondition() {
  const [searchCondition, setSearchCondition] = useState<SearchCondition>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            return JSON.parse(saved) as SearchCondition;
          } catch (error) {
            console.error("Failed to parse search condition:", error);
          }
        }
      }
      return { keyword: "", status: "active" };
    },
  );

  const updateSearchCondition = useCallback(
    (newCondition: Partial<SearchCondition>) => {
      setSearchCondition((prev) => ({ ...prev, ...newCondition }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCondition));
    },
    [],
  );

  return { searchCondition, updateSearchCondition };
}
