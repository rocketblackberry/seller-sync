import { NextRequest, NextResponse } from "next/server";
import { getUserBySub } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sub: string }> }
): Promise<NextResponse> {
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
