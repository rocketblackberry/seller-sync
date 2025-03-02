import { getExchangeRate } from "@/db/exchanges";
import { NextResponse } from "next/server";

/**
 * 為替レートを取得する
 */
export async function GET(): Promise<NextResponse> {
  try {
    const rate = await getExchangeRate();

    return NextResponse.json({ rate });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "為替レートの取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
