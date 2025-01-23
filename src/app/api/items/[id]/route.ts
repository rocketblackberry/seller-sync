import { NextResponse } from "next/server";
import { getItemById, deleteItem } from "@/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getItemById(Number(params.id));

    if (item) {
      return NextResponse.json(item);
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { params } = context;

  try {
    const item = await getItemById(Number(params.id));

    if (item) {
      await deleteItem(Number(params.id));
      return NextResponse.json({ message: "Item deleted successfully" });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
