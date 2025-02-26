import { getAllSellers } from "@/db";
import axios from "axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // DBからセラー一覧を取得
    const sellers = await getAllSellers();

    // 各セラーのAPI Functionを実行（非同期で起動）
    Promise.allSettled(
      sellers.map((seller) =>
        axios
          .get(
            `${process.env.NEXT_URL!}/api/ebay/import-seller?seller=${seller.seller_id}`,
            { timeout: 1000 }, // タイムアウトを設定して素早く次に進む
          )
          .catch((error) => {
            console.error(
              `Failed to trigger import for seller ${seller.seller_id}:`,
              error,
            );
          }),
      ),
    );

    // すぐにレスポンスを返す
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
