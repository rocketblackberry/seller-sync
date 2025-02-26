import { getSellerBySellerId, upsertItems } from "@/db";
import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { Condition, EbayApiError, Seller, Status } from "@/types";
import { convertCondition, convertStatus } from "@/utils";
import { sql } from "@vercel/postgres";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seller = searchParams.get("seller");
  const currentPage = Number(searchParams.get("page")) || 1;
  const maxPages = 10; // 最大ページ数を定数化
  const retryCount = Number(searchParams.get("retry")) || 0; // リトライ回数を追加

  if (!seller) {
    return NextResponse.json({ error: "Seller is required" }, { status: 400 });
  }

  // セラーを取得する
  const sellerData = await getSellerBySellerId(seller);

  if (!sellerData) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const items = [];
  let hasMore = false;

  try {
    const response = await getSellerList(
      sellerData.seller_id,
      sellerData.access_token,
      currentPage,
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
      status: convertStatus(item.SellingStatus?.ListingStatus ?? "") as Status,
    }));

    items.push(...formattedItems);
    hasMore = response.hasMore && currentPage < maxPages;
  } catch (error) {
    if (error instanceof EbayApiError && retryCount < 3) {
      // リトライ回数を制限
      const newAccessToken = await refreshUserAccessToken(
        sellerData.refresh_token,
      );

      // DBのアクセストークンを更新
      const result = await sql<Seller>`
        UPDATE sellers
        SET access_token = ${newAccessToken}, updated_at = NOW()
        WHERE id = ${sellerData.id}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        throw new Error("Failed to update seller");
      }

      // 更新されたトークンで再試行（リトライカウントを増やして）
      const retryUrl = new URL(request.url);
      retryUrl.searchParams.set("retry", (retryCount + 1).toString());

      return GET(
        new NextRequest(retryUrl.toString(), {
          headers: request.headers,
        }),
      );
    }
    throw error;
  }

  // DBにUpsert（バルク）
  if (items.length > 0) {
    await upsertItems(items);
  }

  // 次のページがある場合は新しいリクエストを作成（非同期で）
  if (hasMore) {
    const nextPageUrl = new URL(request.url);
    nextPageUrl.searchParams.set("page", (currentPage + 1).toString());
    nextPageUrl.searchParams.set("retry", "0"); // リトライカウントをリセット

    // 非同期で次のページをトリガー
    setTimeout(() => {
      axios
        .get(nextPageUrl.toString(), {
          headers: Object.fromEntries(request.headers.entries()),
        })
        .catch((error) => {
          console.error(
            `Failed to fetch next page for seller ${seller}:`,
            error,
          );
        });
    }, 0);
  }

  return NextResponse.json(
    {
      message: `Updated ${seller} (page ${currentPage})`,
      hasMore,
      itemCount: items.length,
    },
    { status: 200 },
  );
}
