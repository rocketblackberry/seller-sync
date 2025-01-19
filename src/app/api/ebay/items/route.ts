import { NextResponse } from "next/server";
import items from "@/data/items.json";

export async function GET() {
  try {
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log(req);
  return NextResponse.json({}, { status: 201 });
}
