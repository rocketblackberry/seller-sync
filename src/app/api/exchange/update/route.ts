import { setExchangeRate } from "@/db/exchanges";
import axios from "axios";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_URL!;

/**
 * 為替レートを更新する
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { data } = await axios.get(API_URL);
    const rate = parseFloat(
      data["Realtime Currency Exchange Rate"]["5. Exchange Rate"],
    );

    await setExchangeRate(rate);

    // ログに出力
    console.log("rate", rate);

    return NextResponse.json({ rate });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
