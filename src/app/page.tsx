"use client";

import Header from "@/components/Header";
import ItemDetail from "@/components/ItemDetail";
import ItemList from "@/components/ItemList";
import Loading from "@/components/Loading";
import SearchPanel from "@/components/SearchPanel";
import useItem from "@/hooks/useItem";
import useSearchCondition from "@/hooks/useSearchCondition";
import useSeller from "@/hooks/useSeller";
import useUser from "@/hooks/useUser";
import { Button, useDisclosure } from "@nextui-org/react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, error } = useUser();
  const { selectedSellerId } = useSeller();
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
    if (selectedSellerId) {
      fetchItems(selectedSellerId, searchCondition);
    }
  }, [fetchItems, selectedSellerId, searchCondition]);

  const openDetail = async (id?: number): Promise<void> => {
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
      <div className="flex min-h-screen flex-col p-0 font-[family-name:var(--font-geist-sans)]">
        <header className="border-b p-4">
          <Header />
        </header>
        <main className="flex flex-col gap-4 p-20">
          <div className="flex items-center justify-between">
            <SearchPanel
              condition={searchCondition}
              onChange={updateSearchCondition}
            />
            <Button color="primary" onPress={() => openDetail()}>
              新規追加
            </Button>
          </div>
          <ItemList items={items} onEdit={openDetail} onDelete={deleteItem} />
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
