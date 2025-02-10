import { Seller } from "@/interfaces";
import { sql } from "@vercel/postgres";

export async function getSellersByUserId(user_id: number): Promise<Seller[]> {
  const result =
    await sql<Seller>`SELECT * FROM sellers WHERE user_id = ${user_id} AND 1=1`;

  return result.rows;
}

export async function getSellerById(
  user_id: number,
  seller_id: string,
): Promise<Seller | null> {
  const result =
    await sql<Seller>`SELECT * FROM sellers WHERE user_id = ${user_id} and seller_id = ${seller_id}`;
  return result.rows[0] || null;
}

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

export async function deleteSeller(id: number): Promise<void> {
  await sql`DELETE FROM sellers WHERE id = ${id}`;
}
