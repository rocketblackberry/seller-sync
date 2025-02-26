import { Seller } from "@/types";
import { sql } from "@vercel/postgres";

/**
 * 全セラーのリストを取得する
 */
export async function getAllSellers(): Promise<Seller[]> {
  const result =
    await sql<Seller>`SELECT * FROM sellers WHERE status = 'active'`;

  return result.rows;
}

/**
 * ユーザーIDに紐づくセラーのリストを取得する
 */
export async function getSellersByUserId(user_id: number): Promise<Seller[]> {
  const result =
    await sql<Seller>`SELECT * FROM sellers WHERE user_id = ${user_id}`;

  return result.rows;
}

/**
 * セラーを取得する
 */
export async function getSellerById(id: number): Promise<Seller | null> {
  const result = await sql<Seller>`SELECT * FROM sellers WHERE id = ${id}`;

  return result.rows[0] || null;
}

/**
 * ebayのセラーIDからセラーを取得する
 */
export async function getSellerBySellerId(
  sellerId: string,
): Promise<Seller | null> {
  const result =
    await sql<Seller>`SELECT * FROM sellers WHERE seller_id = ${sellerId}`;

  return result.rows[0] || null;
}

/**
 * セラーを登録または更新する
 */
export async function upsertSeller(
  seller: Omit<Seller, "id">,
): Promise<Seller | null> {
  try {
    const result = await sql<Seller>`
      INSERT INTO sellers (
        user_id, seller_id, name, access_token, refresh_token
      ) VALUES (
        ${seller.user_id}, ${seller.seller_id}, ${seller.name}, ${seller.access_token}, ${seller.refresh_token}
      ) ON CONFLICT (user_id, seller_id) DO UPDATE SET
        name = EXCLUDED.name,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error("Error updating seller:", error);
    throw new Error("Failed to update seller");
  }
}

/**
 * セラーを削除する
 */
export async function deleteSeller(id: number): Promise<void> {
  await sql`DELETE FROM sellers WHERE id = ${id}`;
}
