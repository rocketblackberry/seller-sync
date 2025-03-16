import { getSellerBySellerId, upsertItems } from "@/db";
import { inngest } from "@/lib/inngest";
import { getScrapingItems, mergeItems, scrapeItems } from "@/lib/scraping";
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

    // スクレイピング対象の商品を取得（在庫：あり、ステータス：アクティブ）
    const scrapingItems = await getScrapingItems({
      sellerId: sellerData.id,
      pageNumber: currentPage,
      perPage: 10,
    });
    console.log("scrapingItems", {
      items: scrapingItems.items.length,
      pageNumber: scrapingItems.pageNumber,
      perPage: scrapingItems.perPage,
      totalItems: scrapingItems.totalItems,
      totalPages: scrapingItems.totalPages,
      hasMore: scrapingItems.hasMore,
    });
    /* console.log(
      scrapingItems.items
        .map((item) =>
          Object.entries(item)
            .map(([key, value]) =>
              key === "url" && typeof value === "string"
                ? value.slice(0, 50)
                : value,
            )
            .join(","),
        )
        .join("\n"),
    ); */

    // 仕入先をスクレイピング
    const scrapedItems = await scrapeItems({
      items: scrapingItems.items.map((item) => ({
        id: item.id ?? "",
        url: item.url ?? "",
      })),
    });
    console.log("scrapedItems", scrapedItems);

    // スクレイピング結果をマージ
    const mergedItems = await mergeItems(scrapingItems.items, scrapedItems);
    console.log(
      "mergedItems",
      mergedItems
        .map((item) =>
          Object.entries(item)
            .map(([key, value]) =>
              key === "url" && typeof value === "string"
                ? value.slice(0, 50)
                : value,
            )
            .join(","),
        )
        .join("\n"),
    );

    // DBにアップサート
    const updatedItems = mergedItems.filter(
      (item) => item.label === "verified" || item.label === "updated",
    );

    if (updatedItems.length > 0) {
      await upsertItems(
        updatedItems.map((item) => ({
          id: item.id,
          seller_id: item.seller_id,
          price: item.price,
          cost: item.cost,
          profit: item.profit,
          stock: item.stock,
          scrape_error: item.scrape_error,
          scraped_at: item.scraped_at,
          updated_at: item.updated_at,
        })),
      );
    }

    // 次のページがある場合は次のページをInngestでキュー
    const hasMore =
      scrapingItems.hasMore &&
      scrapingItems.items.length > 0 &&
      scrapingItems.pageNumber < scrapingItems.totalPages;

    if (hasMore) {
      await inngest.send({
        name: "scrape.supplier.page",
        data: {
          sellerId: seller,
          page: currentPage + 1,
        },
      });
    }

    return NextResponse.json(
      {
        message: `Scraped ${seller} (page ${currentPage})`,
        hasMore,
        itemCount: scrapingItems.items.length,
        currentPage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Scraping failed:", error);
    return NextResponse.json(
      { error: "Scraping failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}
