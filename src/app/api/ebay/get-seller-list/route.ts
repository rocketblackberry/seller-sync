import { getAllSellers } from "@/db";
import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { EbayApiError, Seller } from "@/types";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * eBayから出品情報を取得する（全セラー分）
 */
export async function GET(): Promise<NextResponse> {
  try {
    // セラーリストを取得する
    const sellers: Seller[] = await getAllSellers();

    if (sellers.length === 0) {
      return NextResponse.json({ error: "No sellers found" }, { status: 404 });
    }

    for (const seller of sellers) {
      let sellerList;

      try {
        sellerList = await getSellerList(seller.seller_id, seller.access_token);
      } catch (error) {
        if (error instanceof EbayApiError) {
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
          sellerList = await getSellerList(seller.seller_id, newAccessToken);
        } else {
          throw error;
        }
      }

      return NextResponse.json(sellerList);
    }

    return NextResponse.json(sellers);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
