import { sql } from "@vercel/postgres";

/**
 * 為替レートを取得する
 */
export const getExchangeRate = async (): Promise<number> => {
  const result = await sql`
    SELECT rate
    FROM exchanges
    WHERE from_currency='USD' AND to_currency='JPY';
  `;

  if (!result.rows[0]) {
    throw new Error("為替レートが見つかりません");
  }

  return result.rows[0].rate;
};

/**
 * 為替レートを更新する
 */
export const setExchangeRate = async (rate: number): Promise<void> => {
  try {
    await sql`
    UPDATE exchanges
    SET rate = ${rate}, updated_at = NOW()
    WHERE from_currency='USD' AND to_currency='JPY';
  `;
  } catch {
    throw new Error("為替レートの更新に失敗しました");
  }
};
