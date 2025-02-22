import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { EbayApiError, EbayItem, MappedItem, Seller } from "@/types";
import { convertCondition, convertStatus } from "@/utils";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

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

      const result: MappedItem[] = items.map((item: EbayItem) => ({
        id: item.ItemID,
        title: item.Title,
        image: Array.isArray(item.PictureDetails?.PictureURL)
          ? item.PictureDetails?.PictureURL[0]
          : item.PictureDetails?.PictureURL,
        condition: item.ConditionID,
        convertedCondition: convertCondition(item.ConditionID || ""),
        stock: item.Quantity,
        status: item.SellingStatus?.ListingStatus || "",
        convertedStatus: convertStatus(item.SellingStatus?.ListingStatus || ""),
      }));

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
