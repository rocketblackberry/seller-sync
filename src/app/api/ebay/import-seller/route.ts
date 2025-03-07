import { getSellerBySellerId, upsertItems } from "@/db";
import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { Condition, EbayApiError, Seller, Status } from "@/types";
import { convertCondition, convertStatus } from "@/utils";
import { sql } from "@vercel/postgres";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seller = searchParams.get("seller");
    const currentPage = Number(searchParams.get("page")) || 1;
    const retryCount = Number(searchParams.get("retry")) || 0;
    const MAX_PAGES = 10;
    const MAX_RETRIES = 3;

    if (!seller) {
      return NextResponse.json(
        { error: "Seller is required" },
        { status: 400 },
      );
    }

    // セラーを取得
    const sellerData = await getSellerBySellerId(seller);
    if (!sellerData) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // eBay APIからデータを取得
    let response;
    try {
      response = await getSellerList(
        sellerData.seller_id,
        sellerData.access_token,
        currentPage,
      );
    } catch (error) {
      if (error instanceof EbayApiError && retryCount < MAX_RETRIES) {
        // トークンをリフレッシュして再試行
        try {
          const newAccessToken = await refreshUserAccessToken(
            sellerData.refresh_token,
          );
          const result = await sql<Seller>`
            UPDATE sellers
            SET access_token = ${newAccessToken}, updated_at = NOW()
            WHERE id = ${sellerData.id}
            RETURNING *
          `;

          if (result.rows.length === 0) {
            throw new Error("Failed to update seller token");
          }

          // 新しいURLで再試行をトリガー
          const retryUrl = new URL(request.url);
          retryUrl.searchParams.set("retry", (retryCount + 1).toString());

          // 非同期で再試行
          axios
            .get(retryUrl.toString(), {
              headers: Object.fromEntries(request.headers.entries()),
            })
            .catch((error) => {
              console.error(`Retry failed for seller ${seller}:`, error);
            });

          return NextResponse.json(
            {
              message: `Retrying for ${seller} (page ${currentPage})`,
              retryCount: retryCount + 1,
            },
            { status: 202 },
          );
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw new Error("Failed to refresh token");
        }
      }
      throw error;
    }

    // アイテムをフォーマット
    const formattedItems = response.items.map((item) => ({
      id: item.ItemID,
      seller_id: sellerData.id,
      title: item.Title,
      image: Array.isArray(item.PictureDetails?.PictureURL)
        ? item.PictureDetails?.PictureURL[0]
        : item.PictureDetails?.PictureURL,
      condition: convertCondition(item.ConditionID ?? "") as Condition,
      stock:
        parseInt(item.Quantity ?? "0") -
        parseInt(item.SellingStatus?.QuantitySold ?? "0"),
      status: convertStatus(item.SellingStatus?.ListingStatus ?? "") as Status,
    }));

    // DBにアップサート
    if (formattedItems.length > 0) {
      await upsertItems(formattedItems);
    }

    // CSVヘッダーとデータを一括でログ出力
    const headers = [
      "id",
      "seller_id",
      "title",
      "image",
      "condition",
      "stock",
      "status",
    ];
    const csvRows = [
      headers.join(","),
      ...formattedItems.map((item) =>
        headers
          .map((header) => {
            const value = item[header as keyof typeof item];
            const stringValue = String(value).replace(/"/g, '""'); // ダブルクォートをエスケープ
            return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
          })
          .join(","),
      ),
    ];
    console.log(csvRows.join("\n"));

    // 次のページがあり、最大ページ数未満の場合は次のページをトリガー
    const hasMore =
      response.hasMore && response.items.length > 0 && currentPage < MAX_PAGES;
    console.log("hasMore", hasMore);

    if (hasMore) {
      const nextPageUrl = new URL(request.url);
      nextPageUrl.searchParams.set("page", (currentPage + 1).toString());
      nextPageUrl.searchParams.set("retry", "0");

      console.log("nextPageUrl", nextPageUrl.toString());
      // 15秒待機してから次のページを処理
      await delay(15000);

      console.log(1);
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
      console.log(2);
    }

    return NextResponse.json(
      {
        message: `Updated ${seller} (page ${currentPage})`,
        hasMore,
        itemCount: formattedItems.length,
        currentPage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json(
      { error: "Import failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}
