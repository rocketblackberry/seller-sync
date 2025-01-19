import { NextResponse } from "next/server";
import items from "@/data/items.json";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = items.find((item) => item.id === params.id);

    if (item) {
      return NextResponse.json(item);
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = items.find((item) => item.id === params.id);

    if (item) {
      const newItem = await req.json();
      return NextResponse.json({ ...item, ...newItem });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = items.find((item) => item.id === params.id);

    if (item) {
      return NextResponse.json({}, { status: 204 });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
