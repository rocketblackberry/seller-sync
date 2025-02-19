import { EbayApiError, Seller } from "@/interfaces";
import { addItem, refreshUserAccessToken } from "@/lib/ebay";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

/**
 * 商品を登録する
 */
export async function POST(): Promise<NextResponse> {
  // セラーリストを取得する
  const { rows: sellers }: { rows: Seller[] } =
    await sql`SELECT * FROM sellers where id <> 1`;

  if (sellers.length === 0) {
    return NextResponse.json({ error: "No sellers found" }, { status: 404 });
  }

  try {
    for (const seller of sellers) {
      try {
        const response = await addItem(null, seller.access_token);

        return NextResponse.json(response);
      } catch (error) {
        if (error instanceof EbayApiError && error.code === "932") {
          // アクセストークンが無効な場合、更新を試みる
          const newAccessToken = await refreshUserAccessToken(
            seller.refresh_token,
          );

          // DBのアクセストークンを更新
          await sql`
            UPDATE sellers
            SET access_token = ${newAccessToken}, updated_at = NOW()
            WHERE id = ${seller.id}
          `;

          // 更新したトークンで再リクエスト
          const response = await addItem(null, newAccessToken);

          return NextResponse.json(response);
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json(sellers);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
