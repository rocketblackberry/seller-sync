"use client";

import { Button, Form, Input, Textarea } from "@nextui-org/react";

export default function Search() {
  return (
    <div className="flex flex-col min-h-screen p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="p-4 border-b">
        <h1>Search</h1>
      </header>
      <main className="p-4 flex flex-col gap-4">
        <Form>
          <div className="grid grid-cols-4 w-full gap-4">
            <Input
              name="itemId"
              label="Item ID"
              value="123456"
              placeholder=""
            />
          </div>
          <div className="grid grid-cols-2 w-full gap-4">
            <Input
              name="brand"
              label="Brand"
              value="サムライチャンプルー ヌジャベス"
              placeholder=""
            />
            <div className="flex gap-2">
              <Button>Google</Button>
              <Button>Amazon</Button>
              <Button>メルカリ</Button>
              <Button>ヤフオク</Button>
            </div>
          </div>
          <div className="grid grid-cols-5 w-full gap-4">
            <Input name="price" label="Price" value="120" placeholder="" />
            <Input name="cost" label="Cost" value="10999" placeholder="" />
            <Input name="freight" label="Freight" value="3000" placeholder="" />
            <Input name="profit" label="Profit" value="1000" placeholder="" />
            <Input name="margin" label="Margin" value="10%" placeholder="" />
          </div>
          <div className="grid grid-cols-2 w-full gap-4">
            <Input
              name="supplier_url"
              label="Supplier URL"
              value="https://jp.mercari.com/item/m52426752496"
              placeholder=""
            />
          </div>
          <div className="grid grid-cols-2 w-full gap-4">
            <Textarea
              name="description"
              label="Description JA"
              value="【新品未開封】
『samurai champloo music record “Nujabes” 』

レコードの日に発売されたBOXセットの商品です。７インチのレコード６枚セットです、CDではないのでご注意ください。"
            />
            <Textarea
              name="description_translated"
              label="Description EN"
            ></Textarea>
          </div>
          <div className="flex gap-4">
            <Button>Clear</Button>
            <Button>Sell Similer</Button>
          </div>
          <div className="grid grid-cols-4 w-full gap-4">
            <Input
              name="itemId"
              label="Item ID"
              value="123456"
              placeholder=""
            />
          </div>
          <div className="flex gap-4">
            <Button>Save</Button>
          </div>
        </Form>
      </main>
    </div>
  );
}
