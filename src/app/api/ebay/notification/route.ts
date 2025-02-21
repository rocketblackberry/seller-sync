import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// 環境変数からVerification Tokenを取得
const verificationToken = process.env.EBAY_VERIFICATION_TOKEN!;

// エンドポイントのURLを設定 (環境変数から取得することを推奨)
const endpointURL = `${process.env.NEXT_URL!}/api/ebay/notification`;

/**
 * challengeResponseを生成する関数
 * @param challengeCode - チャレンジコード
 * @returns challengeResponse
 */
function generateChallengeResponse(challengeCode: string): string {
  const data = challengeCode + verificationToken + endpointURL;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function GET(request: NextRequest) {
  // クエリパラメータからchallenge_codeを取得
  const { searchParams } = new URL(request.url);
  const challengeCode = searchParams.get("challenge_code");

  // challenge_codeがない場合はエラーを返す
  if (!challengeCode) {
    return new NextResponse("Missing challenge_code parameter", {
      status: 400,
    });
  }

  // challengeResponseを生成
  const challengeResponse = generateChallengeResponse(challengeCode);

  // レスポンスをJSON形式で返す
  const response = { challengeResponse: challengeResponse };
  return NextResponse.json(response, { status: 200 });
}

export async function POST(request: NextRequest) {
  // リクエストボディからchallenge_codeを取得
  const { challenge_code: challengeCode } = await request.json();

  // challenge_codeがない場合はエラーを返す
  /* if (!challengeCode) {
    return new NextResponse("Missing challenge_code parameter", {
      status: 400,
    });
  } */

  // challengeResponseを生成
  const challengeResponse = generateChallengeResponse(challengeCode);

  // レスポンスをJSON形式で返す
  const response = { challengeResponse: challengeResponse };
  return NextResponse.json(response, { status: 200 });
}
