import { getSellersByUserId, getUserBySub } from "@/db";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ログインユーザーの情報を取得
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  const { sub } = session.user;
  const user = await getUserBySub(sub);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const sellers = await getSellersByUserId(user.id);

    return NextResponse.json(sellers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
