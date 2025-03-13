import { getUserBySub } from "@/db";
import { upsertSeller } from "@/db/sellers";
import { getUser, getUserAccessToken } from "@/lib/ebay";
import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code not found" },
      { status: 400 },
    );
  }

  try {
    const tokenData = await getUserAccessToken(code);

    // eBayからのレスポンス
    const { access_token, refresh_token } = tokenData;

    // ログインユーザーの情報を取得
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "User not logged in" },
        { status: 401 },
      );
    }

    const { sub } = session.user;
    const user = await getUserBySub(sub);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // セラー情報を取得する
    const { sellerId, storeName } = await getUser(access_token);

    // セラー情報をデータベースに保存する
    const now = new Date();
    await upsertSeller({
      user_id: user.id,
      seller_id: sellerId,
      name: storeName ?? sellerId,
      access_token,
      refresh_token,
      created_at: now,
      updated_at: now,
    });

    const response = NextResponse.redirect(
      new URL(process.env.NEXT_URL!, req.url),
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
