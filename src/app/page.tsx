"use client";

import { useState } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import List from "@/components/List";
import Detail from "@/components/Detail";
import Login from "@/components/Login";
import Tab from "@/components/Tab";
import useExchangeRate from "@/hooks/useExchangeRate";

export default function Home() {
  const { exchangeRate, loading, error } = useExchangeRate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [itemId, setItemId] = useState<string | null>(null);

  // 新しいアイテムを追加するためのモーダルを開く
  const handleAdd = (): void => {
    setItemId(null);
    onOpen();
  };

  // 既存のアイテムを編集するためのモーダルを開く
  const handleEdit = async (id: string): Promise<void> => {
    setItemId(id);
    onOpen();
  };

  // アイテムを削除する
  const handleDelete = (id: string): void => {
    // ダイアログを表示して削除する
    console.log("handleDelete", id);
  };

  // Terapeakでアイテムを編集する
  const handleLink = (id: string): void => {
    window.open(`https://www.terapeak.com/item/${id}`, "_blank");
  };

  return (
    <>
      <div className="flex flex-col min-h-screen p-0 font-[family-name:var(--font-geist-sans)]">
        <header className="p-4 border-b">
          <div className="flex justify-between gap-8">
            <h1 className="font-bold">eBay Manager</h1>
            <div className="flex gap-4">
              <div>&yen;{exchangeRate}</div>
              <Login />
            </div>
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
      <Detail itemId={itemId} isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
