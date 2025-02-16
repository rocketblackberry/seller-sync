import useUser from "@/hooks/useUser";
import { Seller } from "@/interfaces";
import { useCallback, useEffect, useState } from "react";

// セラーデータのキャッシュを保持するオブジェクト
const sellerCache: { [key: string]: Seller[] } = {};

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
  const [selectedSellerId, setSelectedSellerId] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API からセラー一覧を取得する
  const fetchSellers = useCallback(async () => {
    if (!user) return;

    // キャッシュをチェック
    if (sellerCache[user.sub]) {
      setSellers(sellerCache[user.sub]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/sellers");
      if (!response.ok) {
        throw new Error("Failed to fetch sellers");
      }
      const data: Seller[] = await response.json();
      setSellers(data);
      sellerCache[user.sub] = data; // キャッシュに保存
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const sellerId = localStorage.getItem("sellerId");
    if (sellerId) {
      setSelectedSellerId(parseInt(sellerId, 10));
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

  return { sellers, selectedSellerId, updateSelectedSeller, loading, error };
}
