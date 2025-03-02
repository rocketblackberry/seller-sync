"use client";

import Header from "@/components/Header";
import ItemDetail from "@/components/ItemDetail";
import ItemList from "@/components/ItemList";
import Loading from "@/components/Loading";
import SearchPanel from "@/components/SearchPanel";
import useItem from "@/hooks/useItem";
import useSearchCondition from "@/hooks/useSearchCondition";
import useUser from "@/hooks/useUser";
import { useExchangeRateStore } from "@/stores/exchangeRateStore";
import { useSellerStore } from "@/stores/sellerStore";
import { Button, useDisclosure } from "@nextui-org/react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, error } = useUser();
  const { fetchExchangeRate } = useExchangeRateStore();
  const { selectedSellerId, fetchSellers, selectSeller } = useSellerStore();
  const { searchCondition, updateSearchCondition } = useSearchCondition();
  const {
    items,
    item,
    fetchItems,
    fetchItem,
    initItem,
    updateItem,
    deleteItem,
  } = useItem();
  const { isOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  useEffect(() => {
    const sellerId = localStorage.getItem("sellerId");
    if (sellerId) {
      selectSeller(parseInt(sellerId, 10));
    }
  }, [selectSeller]);

  useEffect(() => {
    if (user) {
      fetchSellers(user.sub);
    }
  }, [fetchSellers, user]);

  useEffect(() => {
    if (selectedSellerId) {
      fetchItems(selectedSellerId, searchCondition);
    }
  }, [fetchItems, selectedSellerId, searchCondition]);

  const openDetail = async (id?: string): Promise<void> => {
    if (id) {
      await fetchItem(id);
    } else {
      initItem(selectedSellerId);
    }
    onOpenChange();
  };

  if (loading || error || !user) {
    return <Loading loading={loading} error={error} />;
  }

  return (
    <>
      <div className="flex max-h-screen min-h-screen flex-col overflow-hidden p-0 font-[family-name:var(--font-geist-sans)]">
        <header className="flex h-16 items-center border-b px-8">
          <Header />
        </header>
        <main className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-8">
          <div className="flex items-center justify-between">
            <SearchPanel
              condition={searchCondition}
              onChange={updateSearchCondition}
            />
            <Button
              className="bg-black text-white"
              onPress={() => openDetail()}
            >
              新規追加
            </Button>
          </div>
          <div className="h-full overflow-hidden">
            <ItemList items={items} onEdit={openDetail} onDelete={deleteItem} />
          </div>
        </main>
      </div>
      <ItemDetail
        item={item}
        isOpen={isOpen}
        onUpdate={updateItem}
        onDelete={deleteItem}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
