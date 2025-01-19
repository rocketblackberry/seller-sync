import { NextResponse } from "next/server";
import { getItems, addItem } from "@/db";
import { Item } from "@/models/types";

export async function GET() {
  try {
    const items = await getItems();
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const item: Omit<Item, "id" | "createdAt" | "updatedAt" | "syncedAt"> =
      await req.json();
    const newItem = await addItem(item);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
