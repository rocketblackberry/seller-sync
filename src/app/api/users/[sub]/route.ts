import { NextResponse } from "next/server";
import { getUserBySub } from "@/db";

export async function GET(
  request: Request,
  { params }: { params: { sub: string } }
) {
  const { sub } = await params;

  if (!sub) {
    return NextResponse.json({ error: "sub is required" }, { status: 400 });
  }

  try {
    const user = await getUserBySub(sub);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
