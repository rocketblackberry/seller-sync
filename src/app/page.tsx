"use client";

import Header from "@/components/Header";
import ItemDetail from "@/components/ItemDetail";
import ItemList from "@/components/ItemList";
import Loading from "@/components/Loading";
import SearchPanel from "@/components/SearchPanel";
import {
  useExchangeRateStore,
  useItemStore,
  useSearchConditionStore,
  useSellerStore,
  useUserStore,
} from "@/stores";
import { useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import { Button, useDisclosure } from "@nextui-org/react";
import { useEffect } from "react";

export default function Home() {
  const { user: auth0User } = useAuth0User();
  const { user, loading, error, fetchUser } = useUserStore();
  const { fetchExchangeRate } = useExchangeRateStore();
  const { selectedSellerId } = useSellerStore();
  const { condition, updateCondition } = useSearchConditionStore();
  const { fetchItem, initItem } = useItemStore();
  const { isOpen, onOpenChange } = useDisclosure();

  const openDetail = async (id?: string): Promise<void> => {
    if (id) {
      await fetchItem(id);
    } else {
      initItem(selectedSellerId);
    }
    onOpenChange();
  };

  useEffect(() => {
    if (auth0User) {
      fetchUser(auth0User);
    }
  }, [auth0User, fetchUser]);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

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
            <SearchPanel condition={condition} onChange={updateCondition} />
            <Button
              className="bg-black text-white"
              onPress={() => openDetail()}
            >
              新規追加
            </Button>
          </div>
          <ItemList onClick={openDetail} />
        </main>
      </div>
      <ItemDetail isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
