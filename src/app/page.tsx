"use client";

import { useState } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
// import ItemList from "@/components/Item/List";
import List from "@/components/List2";
// import ItemDetail from "@/components/Item/Detail";
import Research from "@/components/Research";
import Login from "@/components/Login";
import Tab from "@/components/Tab";
import { CONDITION_OPTIONS } from "@/constants";
import { IItem2 } from "@/interfaces";
import useExchangeRate from "@/hooks/useExchangeRate";

type DefaultItem = Omit<
  IItem2,
  | "view"
  | "watch"
  | "sold"
  | "selected"
  | "createdAt"
  | "updatedAt"
  | "syncedAt"
>;

const defaultItem: DefaultItem = {
  id: 0,
  item_id: "",
  // source_item_id: "",
  // maker: "",
  // series: "",
  // name: "",
  title: "",
  // description: "",
  images: [],
  condition: "used",
  condition_description: "",
  category_id: "",
  specs: [],
  price: 0,
  stock: 1,
  supplier: "",
  supplier_url: "",
  cost: 0,
  weight: 1000,
  freight: 0,
  shipping_policy: "expedited_1500",
  promote: 2.0,
  status: "draft",
};

export default function Home() {
  const { exchangeRate, loading, error } = useExchangeRate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentItem, setCurrentItem] = useState<DefaultItem>(defaultItem);

  // 新しいアイテムを追加するためのモーダルを開く
  const handleAdd = (): void => {
    setCurrentItem(defaultItem); // モーダルの内容をリセット
    onOpen();
  };

  // 既存のアイテムを編集するためのモーダルを開く
  const handleEdit = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const item = await response.json();
      setCurrentItem(item);
      onOpen();
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  // アイテムを削除する
  const handleDelete = (id: number): void => {
    // ダイアログを表示して削除する
    console.log("handleDelete", id);
  };

  // Terapeakでアイテムを編集する
  const handleLink = (id: number): void => {};

  return (
    <>
      <div className="flex flex-col min-h-screen p-0 font-[family-name:var(--font-geist-sans)]">
        <header className="p-4 border-b">
          <div className="flex justify-between gap-8">
            <h1 className="font-bold">eBay Manager</h1>
            <Login />
          </div>
        </header>
        <main className="p-20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Tab />
            <Button onPress={handleAdd}>新規追加</Button>
          </div>
          <List
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLink={handleLink}
          />
        </main>
      </div>
      {/* <ItemDetail
        item={currentItem}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
      /> */}
      <Research isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
