import { NextResponse } from "next/server";
import { getItems, upsertItem } from "@/db";
import { Item } from "@/interfaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const status = searchParams.get("status") || "";

  try {
    const items = await getItems({ keyword, status });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const item: Item = await request.json();
    const updatedItem = await upsertItem(item);

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
