import { getAllSellers } from "@/db";
import axios from "axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // DBからセラー一覧を取得
    const sellers = await getAllSellers();

    // 各セラーのAPI Functionをトリガー（完了は待たない）
    const triggerPromises = sellers.map((seller) =>
      axios
        .get(
          `${process.env.NEXT_URL!}/api/ebay/import?seller=${seller.seller_id}`,
        )
        .catch((error) => {
          console.error(
            `Failed to trigger import for seller ${seller.seller_id}:`,
            error.message,
          );
        }),
    );

    // リクエストの開始だけを待つ（完了は待たない）
    await Promise.all(
      triggerPromises.map((p) =>
        Promise.race([
          p,
          new Promise((resolve) => setTimeout(resolve, 1000)), // 1秒でタイムアウト
        ]),
      ),
    );

    return NextResponse.json(
      {
        message: "Import started",
        triggeredSellerCount: sellers.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to trigger imports:", error);
    return NextResponse.json(
      { error: "Failed to trigger imports" },
      { status: 500 },
    );
  }
}
