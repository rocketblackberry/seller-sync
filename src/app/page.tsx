"use client";

import CenterBox from "@/components/CenterBox";
import Header from "@/components/Header";
import ItemDetail from "@/components/ItemDetail";
import ItemList from "@/components/ItemList";
import SearchPanel from "@/components/SearchPanel";
import { FVF_RATE, PROMOTE_RATE } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { Item, SearchCondition } from "@/interfaces/item";
import { Button, CircularProgress, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";

const initItem: Item = {
  id: 0,
  seller_id: 0,
  item_id: "",
  keyword: "",
  title: "",
  condition: "used",
  description: "",
  description_ja: "",
  supplier_url: "",
  price: 0,
  cost: 0,
  weight: 1.0,
  freight: 0,
  profit: 0,
  profit_rate: 10.0,
  fvf_rate: FVF_RATE,
  promote_rate: PROMOTE_RATE,
  stock: 1,
  status: "draft",
};

export default function Home() {
  const { user, loading, error } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [sellerId, setSellerId] = useState<number>(
    parseInt(localStorage.getItem("sellerId") || "0"),
  );
  const [searchCondition, setSearchCondition] = useState<SearchCondition>(
    localStorage.getItem("searchCondition")
      ? JSON.parse(localStorage.getItem("searchCondition")!)
      : {
          keyword: "",
          status: "active",
        },
  );
  const [items, setItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item>(initItem);

  useEffect(() => {
    getItems();
    localStorage.setItem("searchCondition", JSON.stringify(searchCondition));
  }, [searchCondition]);

  const openDetail = async (id?: number): Promise<void> => {
    if (id) {
      await getItem(id);
    } else {
      setItem(initItem);
    }
    onOpenChange();
  };

  const openTerapeak = (item_id: string): void => {
    window.open(`https://www.terapeak.com/item/${item_id}`, "_blank");
  };

  // アイテムリストを取得する
  const getItems = async (): Promise<void> => {
    try {
      const params = [];
      params.push(`sellerId=${sellerId}`);
      const { keyword, status } = searchCondition;
      if (keyword) {
        params.push(`keyword=${encodeURIComponent(keyword)}`);
      }
      if (status) {
        params.push(`status=${encodeURIComponent(status)}`);
      }
      const response = await fetch(
        `/api/items${params.length ? "?" + params.join("&") : ""}`,
      );
      const data = await response.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  // アイテムを取得する
  const getItem = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/items/${id}`);
      const data = await response.json();
      setItem(data);
    } catch (e) {
      console.error(e);
    }
  };

  // アイテムを保存する
  const upsertItem = async (item: Item): Promise<void> => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error(`Failed to upsert item`);
      }
      const data = await response.json();
      setItem(data);
    } catch (e) {
      console.error(`Error saving item:`, e);
    }
  };

  // アイテムを削除する
  const deleteItem = async (id: number): Promise<void> => {
    if (!confirm("削除しますか？")) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete item`);
      }
      setItem(initItem);
    } catch (e) {
      console.error(`Error deleting item:`, e);
    }
  };

  if (error) return <CenterBox>Error</CenterBox>;
  if (loading)
    return (
      <CenterBox>
        <CircularProgress label="Loading..." />
      </CenterBox>
    );
  if (!user)
    return (
      <CenterBox>
        <a className="underline" href="/api/auth/login">
          Login Required
        </a>
      </CenterBox>
    );

  return (
    <>
      <div className="flex min-h-screen flex-col p-0 font-[family-name:var(--font-geist-sans)]">
        <header className="border-b p-4">
          <Header sellerId={sellerId} onSellerChange={setSellerId} />
        </header>
        <main className="flex flex-col gap-4 p-20">
          <div className="flex items-center justify-between">
            <SearchPanel
              condition={searchCondition}
              onChange={setSearchCondition}
              onSubmit={getItems}
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
        onDelete={deleteItem}
        onSubmit={upsertItem}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
