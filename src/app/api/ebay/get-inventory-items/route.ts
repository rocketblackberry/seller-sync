import { upsertItem } from "@/db";
import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { Condition, EbayApiError, Seller, Status } from "@/types";
import { convertCondition, convertStatus } from "@/utils";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * eBayから出品情報を取得する（全セラー分）
 */
export async function GET(): Promise<NextResponse> {
  try {
    // セラーリストを取得する
    const { rows: sellers }: { rows: Seller[] } =
      await sql`SELECT * FROM sellers where status = 'active'`;

    if (sellers.length === 0) {
      return NextResponse.json({ error: "No sellers found" }, { status: 404 });
    }

    for (const seller of sellers) {
      let items = [];

      try {
        items = await getSellerList(seller.seller_id, seller.access_token);
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
          items = await getSellerList(seller.seller_id, newAccessToken);
        } else {
          throw error;
        }
      }

      const result = { success: 0, failure: 0 };

      // 商品情報をDBに保存
      for (const item of items) {
        try {
          await upsertItem({
            id: item.ItemID,
            title: item.Title,
            image: Array.isArray(item.PictureDetails?.PictureURL)
              ? item.PictureDetails?.PictureURL[0]
              : item.PictureDetails?.PictureURL,
            condition: convertCondition(item.ConditionID) as Condition,
            stock: item.Quantity,
            status: convertStatus(item.SellingStatus?.ListingStatus) as Status,
          });
          result.success++;
        } catch (error) {
          console.error(error);
          result.failure++;
        }
      }

      return NextResponse.json(result);
    }

    return NextResponse.json(sellers);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
