import { exchangeCodeForAccessToken } from "@/lib/ebay";
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
    const tokenData = await exchangeCodeForAccessToken(code);

    // eBay からのレスポンス
    const { access_token, refresh_token, expires_in } = tokenData;

    // Cookie にアクセストークンを保存 (オプション)
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expires_in,
    });
    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30日間有効
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
