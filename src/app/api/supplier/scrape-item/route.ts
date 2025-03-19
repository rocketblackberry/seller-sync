import { getItem, upsertItems } from "@/db";
import { mergeItems, scrapeItems } from "@/lib/scraping";
import { NextRequest, NextResponse } from "next/server";

export type ScrapeItemResponse = {
  message?: string;
  error?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ScrapeItemResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    // スクレイピング対象の商品を取得
    const scrapingItem = await getItem(id);
    if (!scrapingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 仕入先をスクレイピング
    const scrapedItems = await scrapeItems({
      items: [{ id: scrapingItem.id, url: scrapingItem.url }],
    });
    console.log("scrapedItems", scrapedItems);

    // スクレイピング結果をマージ
    const mergedItems = await mergeItems([scrapingItem], scrapedItems);
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

    return NextResponse.json(
      {
        message: `Scraped ${id}`,
        error: scrapedItems[0].error,
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
