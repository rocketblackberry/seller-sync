"use client";

import { useState } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import ItemList from "@/components/Item/List";
import ItemDetail from "@/components/Item/Detail";
import Login from "@/components/Login";
import Tab from "@/components/Tab";
import { CONDITION } from "@/constants";
import { Item } from "@/interfaces";
import useExchangeRate from "@/hooks/useExchangeRate";

type DefaultItem = Omit<
  Item,
  | "view"
  | "watch"
  | "sold"
  | "selected"
  | "createdAt"
  | "updatedAt"
  | "syncedAt"
>;

const defaultItem: DefaultItem = {
  id: undefined,
  ebayId: "",
  sourceEbayId: "",
  maker: "",
  name: "",
  title: "",
  description: "",
  images: [],
  condition: CONDITION.USED,
  categoryId: "",
  specs: [],
  price: 0,
  stock: 0,
  supplier: "",
  supplierUrl: "",
  cost: 0,
  weight: 1000,
  freight: 0,
  shippingPolicy: "",
  promote: 2,
  status: "",
};

export default function Home() {
  const { exchangeRate, loading, error } = useExchangeRate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentItem, setCurrentItem] = useState<DefaultItem>(defaultItem);

  // 新しいアイテムを追加するためのモーダルを開く
  const handleAdd = (): void => {
    console.log("handleAdd");
    setCurrentItem(defaultItem); // モーダルの内容をリセット
    onOpen();
  };

  // 既存のアイテムを編集するためのモーダルを開く
  const handleEdit = async (id: number): Promise<void> => {
    console.log("handleEdit", id);
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setCurrentItem(data);
      onOpen();
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  // フォームの送信を処理する
  const handleSubmit = async (itemData: Partial<Item>): Promise<void> => {
    const method = itemData.id ? "PUT" : "POST";
    const url = method === "PUT" ? `/api/items/${itemData.id}` : "/api/items";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${method === "PUT" ? "update" : "add"} item`
        );
      }

      await response.json();
      onOpenChange();
    } catch (error) {
      console.error(
        `Error ${method === "PUT" ? "updating" : "adding"} item:`,
        error
      );
    }
  };

  // アイテムを削除する
  const handleDelete = (id: number): void => {
    console.log("handleDelete", id);
    // ダイアログを表示して削除する
  };

  return (
    <>
      <div className="flex flex-col min-h-screen p-20 font-[family-name:var(--font-geist-sans)]">
        <header className="p-4 border-b">
          <div className="flex justify-end gap-8">
            <div>
              ${loading || error ? "-" : (exchangeRate || 0).toFixed(2)}
            </div>
            <Login />
          </div>
        </header>
        <main className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Tab />
            <Button onPress={handleAdd}>追加</Button>
          </div>
          <ItemList onEdit={handleEdit} onDelete={handleDelete} />
        </main>
      </div>
      <ItemDetail
        item={currentItem}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
      />
    </>
  );
}
