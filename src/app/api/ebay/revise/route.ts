import {
  getSellerBySellerId,
  updateSellerAccessToken,
  upsertItems,
} from "@/db";
import { refreshUserAccessToken, reviseItems } from "@/lib/ebay";
import { EbayApiError } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ReviseItemsSchema = z.object({
  seller: z.string(),
  items: z.array(
    z.object({
      itemId: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
});

type ReviseItemsResponse = {
  message?: string;
  error?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ReviseItemsResponse>> {
  try {
    /* if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: "Revise is disabled in development" },
        { status: 400 },
      );
    } */

    const body = await request.json();

    // リクエストボディのバリデーション
    const result = ReviseItemsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error },
        { status: 400 },
      );
    }

    const { seller: sellerId, items } = result.data;

    // セラーを取得
    const seller = await getSellerBySellerId(sellerId);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // ebayを更新
    try {
      await reviseItems(seller.access_token, items);
    } catch (error) {
      if (error instanceof EbayApiError) {
        // トークンをリフレッシュして再実行
        try {
          const accessToken = await refreshUserAccessToken(
            seller.refresh_token,
          );
          await updateSellerAccessToken(seller.id, accessToken);
          await reviseItems(accessToken, items);
        } catch {
          console.log(1);
          return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
          );
        }
      } else {
        console.log(2);
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 500 },
        );
      }
    }

    // DBを更新
    const now = new Date();
    await upsertItems(
      items.map((item) => ({
        id: item.itemId,
        seller_id: seller.id,
        synced_at: now,
        updated_at: now,
      })),
    );

    return NextResponse.json(
      {
        message: `Revised ${items.length} items`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Revise failed:", error);
    return NextResponse.json(
      { error: "Revise failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}
