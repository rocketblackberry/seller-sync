import { getItems, upsertItem } from "@/db";
import { Item, Status } from "@/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * セラーに紐づく商品リストを取得する
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = Number(searchParams.get("sellerId") || "");
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") as Status | undefined;
    const page = Number(searchParams.get("page") || "1");
    const itemsPerPage = Number(searchParams.get("itemsPerPage") || "50");

    const { items, totalItems, totalPages } = await getItems(sellerId, {
      keyword,
      status,
      page,
      itemsPerPage,
    });

    return NextResponse.json({
      items,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

/**
 * 商品を登録または更新する
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const item: Item = await request.json();
    const updatedItem = await upsertItem(item);

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
