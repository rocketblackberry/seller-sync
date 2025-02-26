import { getAllSellers } from "@/db";
import axios from "axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // DBからセラー一覧を取得
    const sellers = await getAllSellers();

    // 各セラーのAPI Functionを並列実行
    await Promise.all(
      sellers.map((seller) =>
        axios.get(
          `${process.env.NEXT_URL!}/api/ebay/import-seller?seller=${seller.seller_id}`,
        ),
      ),
    );

    return NextResponse.json(
      { message: "Seller update triggered." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update sellers:", error);
    return NextResponse.json(
      { error: "Failed to update sellers" },
      { status: 500 },
    );
  }
}
