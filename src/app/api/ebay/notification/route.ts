import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// 環境変数からVerification Tokenを取得
const verificationToken = process.env.EBAY_VERIFICATION_TOKEN!;

// エンドポイントのURLを設定 (環境変数から取得することを推奨)
const endpointURL = `${process.env.NEXT_URL!}/api/ebay/notification`;

export async function POST(request: NextRequest) {
  // クエリパラメータからchallenge_codeを取得
  const challengeCode = request.nextUrl.searchParams.get("challenge_code");

  // challenge_codeがない場合はエラーを返す
  if (!challengeCode) {
    return new NextResponse("Missing challenge_code parameter", {
      status: 400,
    });
  }

  // challengeResponseを生成
  const data = challengeCode + verificationToken + endpointURL;
  const challengeResponse = crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");

  // レスポンスをJSON形式で返す
  const response = { challengeResponse: challengeResponse };
  return NextResponse.json(response, { status: 200 });
}
