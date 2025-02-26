import { getSellerBySellerId, upsertItems } from "@/db";
import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { Condition, EbayApiError, Seller, Status } from "@/types";
import { convertCondition, convertStatus } from "@/utils";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seller = searchParams.get("seller");

  if (!seller) {
    return NextResponse.json({ error: "Seller is required" }, { status: 400 });
  }

  // セラーを取得する
  let sellerData = await getSellerBySellerId(seller);

  if (!sellerData) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const items = [];
  let page = Number(searchParams.get("page")) || 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await getSellerList(
        sellerData.seller_id,
        sellerData.access_token,
        page,
      );
      const formattedItems = response.items.map((item) => ({
        id: item.ItemID,
        seller_id: sellerData!.id,
        title: item.Title,
        image: Array.isArray(item.PictureDetails?.PictureURL)
          ? item.PictureDetails?.PictureURL[0]
          : item.PictureDetails?.PictureURL,
        condition: convertCondition(item.ConditionID ?? "") as Condition,
        stock: parseInt(item.Quantity ?? "0"),
        status: convertStatus(
          item.SellingStatus?.ListingStatus ?? "",
        ) as Status,
      }));
      items.push(...formattedItems);
      hasMore = response.hasMore;
      page++;

      // API実行時間が長すぎないようにチェック
      if (page > 10) break; // 10ページで制限
    } catch (error) {
      // トークンが無効な場合はリフレッシュ
      if (error instanceof EbayApiError) {
        const newTokens = await refreshUserAccessToken(
          sellerData.refresh_token,
        );

        // DBのアクセストークンを更新
        const result: { rows: Seller[] } = await sql`
          UPDATE sellers
          SET access_token = ${newTokens.access_token},
            refresh_token = ${newTokens.refresh_token},
            updated_at = NOW()
          WHERE id = ${sellerData.id}
          RETURNING *
        `;

        if (result.rows.length === 0) {
          throw new Error("Failed to update seller");
        }

        // セラー情報を更新
        sellerData = result.rows[0];

        // 同じページを再試行
        continue;
      }
      throw error;
    }
  }

  // DBにUpsert（バルク）
  await upsertItems(items);

  // もし次のページがあるなら、再帰的にAPI Functionを呼ぶ
  if (hasMore) {
    await fetch(
      `${process.env.NEXT_URL!}/api/ebay/import-seller?seller=${seller}&page=${page}`,
    );
  }

  return NextResponse.json({ message: `Updated ${seller}` }, { status: 200 });
}
