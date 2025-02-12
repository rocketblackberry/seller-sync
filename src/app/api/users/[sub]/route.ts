import { getUserBySub } from "@/db";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

/**
 * Subに紐づくユーザーを取得する
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sub: string }> },
): Promise<NextResponse> {
  try {
    const { sub } = await params;

    if (!sub) {
      return NextResponse.json({ error: "sub is required" }, { status: 400 });
    }

    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "User not logged in" },
        { status: 401 },
      );
    }

    const user = await getUserBySub(sub);

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
