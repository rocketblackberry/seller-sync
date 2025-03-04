/**
 * DeepL APIを使ってテキストを翻訳する
 * @param text
 * @returns translatedText
 */
export const translateText = async (text: string) => {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("翻訳リクエストに失敗しました");
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("翻訳エラー:", error);
    throw error;
  }
};
