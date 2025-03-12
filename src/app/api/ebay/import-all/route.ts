import { getAllSellers } from "@/db";
import { inngest } from "@/lib/inngest";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // DBからセラー一覧を取得
    const sellers = await getAllSellers();

    // 各セラーのインポートジョブをinngestで登録
    await Promise.all(
      sellers.map((seller) =>
        inngest.send({
          name: "import.seller",
          data: {
            sellerId: seller.seller_id,
          },
        }),
      ),
    );

    return NextResponse.json(
      {
        message: "Import jobs queued",
        triggeredSellerCount: sellers.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to queue import jobs:", error);
    return NextResponse.json(
      { error: "Failed to queue import jobs" },
      { status: 500 },
    );
  }
}
