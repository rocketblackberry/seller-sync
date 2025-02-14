import useUser from "@/hooks/useUser";
import { Seller } from "@/interfaces";
import { useCallback, useEffect, useState } from "react";

/**
 * useSeller フック
 * - ログインユーザーに紐づくセラー情報を /api/sellers から取得
 * - 選択中のセラーIDの管理（localStorage との連携付き）
 *
 * @returns {Object} sellers, selectedSellerId, updateSelectedSeller 関数
 */
export default function useSeller() {
  const { user } = useUser();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<number>(
    parseInt(localStorage.getItem("sellerId") || "0"),
  );

  // API からセラー一覧を取得する
  const fetchSellers = useCallback(async () => {
    try {
      const response = await fetch("/api/sellers");
      const data: Seller[] = await response.json();
      setSellers(data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  }, []);

  // ユーザー情報がある場合にセラー一覧を取得
  useEffect(() => {
    if (user) {
      fetchSellers();
    }
  }, [user, fetchSellers]);

  // セラーの選択状態を更新し、localStorage にも保存する
  const updateSelectedSeller = (id: number) => {
    setSelectedSellerId(id);
    localStorage.setItem("sellerId", id.toString());
  };

  return { sellers, selectedSellerId, updateSelectedSeller };
}
