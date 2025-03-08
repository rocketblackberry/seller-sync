import { getSellerBySellerId, upsertItems } from "@/db";
import { classifyItems, getScrapingItems, scrapeItems } from "@/lib/supplier";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seller = searchParams.get("seller");
    const currentPage = Number(searchParams.get("page")) || 1;
    // const retryCount = Number(searchParams.get("retry")) || 0;
    // const MAX_RETRIES = 3;

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

    // スクレイピング対象の商品を取得（在庫：あり、ステータス：アクティブ）
    const scrapingItems = await getScrapingItems({
      sellerId: sellerData.id,
      pageNumber: currentPage,
      perPage: 100,
    });
    console.log("scrapingItems", {
      items: scrapingItems.items.length,
      pageNumber: scrapingItems.pageNumber,
      perPage: scrapingItems.perPage,
      totalItems: scrapingItems.totalItems,
      totalPages: scrapingItems.totalPages,
      hasMore: scrapingItems.hasMore,
    });

    // 仕入先をスクレイピング
    const scrapedItems = await scrapeItems({
      items: scrapingItems.items.map((item) => ({
        id: item.id ?? "",
        url: item.supplier_url ?? "",
      })),
    });
    // console.log("scrapedItems", scrapedItems);

    // TODO: changed, unchangedの配列に分けるんじゃなくて分類ラベルをつけるようにする。ログもcsvで一括出力

    // スクレイピング結果を分類
    const { changedItems, unchangedItems, failedItems } = await classifyItems(
      scrapingItems.items,
      scrapedItems,
    );

    // DBにアップサート
    if (changedItems.length > 0) {
      await upsertItems(changedItems);
    }
    if (unchangedItems.length > 0) {
      await upsertItems(unchangedItems);
    }

    // ログに出力
    console.log(`changedItems: ${changedItems.length}`);
    for (const item of changedItems) {
      console.log(JSON.stringify(item));
    }

    console.log(`unchangedItems: ${unchangedItems.length}`);
    for (const item of unchangedItems) {
      console.log(JSON.stringify(item));
    }

    console.log(`failedItems: ${failedItems.length}`);
    for (const item of failedItems) {
      console.log(JSON.stringify(item));
    }

    // 次のページがあり、最大ページ数未満の場合は次のページをトリガー
    const hasMore =
      scrapingItems.hasMore &&
      scrapingItems.items.length > 0 &&
      scrapingItems.pageNumber < scrapingItems.totalPages;

    if (hasMore) {
      const nextPageUrl = new URL(request.url);
      nextPageUrl.searchParams.set("page", (currentPage + 1).toString());
      nextPageUrl.searchParams.set("retry", "0");

      console.log("nextPageUrl", nextPageUrl.toString());

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
    }

    return NextResponse.json(
      {
        message: `Updated ${seller} (page ${currentPage})`,
        hasMore,
        itemCount: scrapingItems.items.length,
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
