import { NextResponse } from "next/server";
import { getItems, updateItem } from "@/db";
import { Item } from "@/interfaces";

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
    const item: Item = await req.json();
    const updatedItem = await updateItem(item);
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
