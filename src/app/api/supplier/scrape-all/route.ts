import { getAllSellers } from "@/db";
import { inngest } from "@/lib/inngest";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // DBからセラー一覧を取得
    const sellers = await getAllSellers();

    // 各セラーのスクレイピングジョブをinngestで登録
    await Promise.all(
      sellers.map((seller) =>
        inngest.send({
          name: "supplier.scrape.seller",
          data: {
            sellerId: seller.seller_id,
          },
        }),
      ),
    );

    return NextResponse.json(
      {
        message: "Scraping jobs queued",
        triggeredSellerCount: sellers.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to queue scraping jobs:", error);
    return NextResponse.json(
      { error: "Failed to queue scraping jobs" },
      { status: 500 },
    );
  }
}
