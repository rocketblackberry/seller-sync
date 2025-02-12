import { deleteItem, getItemById } from "@/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * 商品を取得する
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const item = await getItemById(Number(id));

    if (item) {
      return NextResponse.json(item);
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * 商品を削除する
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const item = await getItemById(Number(id));

    if (item) {
      await deleteItem(Number(id));
      return NextResponse.json({ message: "Item deleted successfully" });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
