import {
  getItem,
  getSellerBySellerId,
  updateSellerAccessToken,
  upsertItems,
} from "@/db";
import { refreshUserAccessToken, updateItem } from "@/lib/ebay";
import { EbayApiError } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export type ExportItemRequest = {
  id: string;
  seller: string;
};

export type ExportItemResponse = {
  message?: string;
  error?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ExportItemResponse>> {
  try {
    /* if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: "Export is disabled in development" },
        { status: 400 },
      );
    } */

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("seller");
    const id = searchParams.get("id");

    // パラメータをチェック
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: "Seller is required" },
        { status: 400 },
      );
    }

    // セラーを取得
    const seller = await getSellerBySellerId(sellerId);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // 商品を取得
    const item = await getItem(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // ebayを更新
    try {
      await updateItem(item.id, seller.access_token, {
        price: item.price,
        quantity: item.stock,
      });
    } catch (error) {
      if (error instanceof EbayApiError) {
        // トークンをリフレッシュして再実行
        try {
          const accessToken = await refreshUserAccessToken(
            seller.refresh_token,
          );
          await updateSellerAccessToken(seller.id, accessToken);
          await updateItem(item.id, accessToken, {
            price: item.price,
            quantity: item.stock,
          });
        } catch {
          return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 500 },
        );
      }
    }

    // DBを更新
    const now = new Date();
    await upsertItems([
      {
        id: item.id,
        seller_id: item.seller_id, // 念のため
        synced_at: now,
        updated_at: now,
      },
    ]);

    return NextResponse.json(
      {
        message: `Exported ${id}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json(
      { error: "Export failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}
