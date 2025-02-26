import { getAllSellers } from "@/db";
import axios from "axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // DBからセラー一覧を取得
    const sellers = await getAllSellers();

    // 各セラーのAPI Functionを実行（待たない）
    sellers.forEach((seller) => {
      axios
        .get(
          `${process.env.NEXT_URL!}/api/ebay/import-seller?seller=${seller.seller_id}`,
        )
        .catch((error) => {
          console.error(`Failed to update seller ${seller.seller_id}:`, error);
        });
    });

    return NextResponse.json(
      {
        message: "Seller update triggered.",
        count: sellers.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to get sellers:", error);
    return NextResponse.json(
      { error: "Failed to get sellers" },
      { status: 500 },
    );
  }
}
