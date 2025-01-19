import { NextResponse } from "next/server";
import { getItemById, updateItem, deleteItem } from "@/db";
import { Item } from "@/interfaces";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // const { params } = context;
  console.log("GET params:", params); // paramsの内容をログに出力
  try {
    const item = await getItemById(Number(params.id));

    if (item) {
      return NextResponse.json(item);
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    console.error("GET error:", error); // エラーメッセージをログに出力
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  console.log("PUT params:", params); // paramsの内容をログに出力
  try {
    const item = await getItemById(Number(params.id));

    if (item) {
      const newItem = await req.json();
      const updatedItem = await updateItem(Number(params.id), newItem);
      return NextResponse.json(updatedItem);
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    console.error("PUT error:", error); // エラーメッセージをログに出力
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  console.log("DELETE params:", params); // paramsの内容をログに出力
  try {
    const item = await getItemById(Number(params.id));

    if (item) {
      await deleteItem(Number(params.id));
      return NextResponse.json({ message: "Item deleted successfully" });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    console.error("DELETE error:", error); // エラーメッセージをログに出力
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
