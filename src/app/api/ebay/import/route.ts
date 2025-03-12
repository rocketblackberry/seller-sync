import { getSellerBySellerId, upsertItems } from "@/db";
import { getSellerList, refreshUserAccessToken } from "@/lib/ebay";
import { inngest } from "@/lib/inngest";
import { Condition, EbayApiError, Seller, Status } from "@/types";
import { convertCondition, convertStatus } from "@/utils";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seller = searchParams.get("seller");
    const currentPage = Number(searchParams.get("page")) || 1;

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
      console.log("response", {
        items: response.items.length,
        hasMore: response.hasMore,
        totalItems: response.totalItems,
        perPage: response.perPage,
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
      });
    } catch (error) {
      if (error instanceof EbayApiError) {
        // トークンをリフレッシュ
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

          // エラーをスローしてInngestのリトライに任せる
          throw new Error("Token refreshed, retry needed");
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

    // 次のページがある場合は次のページをInngestでキュー
    const hasMore =
      response.hasMore &&
      response.items.length > 0 &&
      response.pageNumber < response.totalPages;

    if (hasMore) {
      await inngest.send({
        name: "import.seller.page",
        data: {
          sellerId: seller,
          page: currentPage + 1,
        },
      });
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
