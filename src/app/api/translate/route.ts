import * as deepl from "deepl-node";
import { NextRequest, NextResponse } from "next/server";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY!;
const translator = new deepl.Translator(DEEPL_API_KEY);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "テキストは必須です" },
        { status: 400 },
      );
    }

    const result = await translator.translateText(
      text,
      "ja", // source language
      "en-US", // target language
      {
        preserveFormatting: true,
        // formality: "more",
      },
    );

    console.log(result);
    const translatedText = Array.isArray(result) ? result[0].text : result.text;

    return NextResponse.json({
      translatedText,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "翻訳中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
