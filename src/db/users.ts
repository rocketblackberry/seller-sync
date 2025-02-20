import { User } from "@/types";
import { sql } from "@vercel/postgres";

/**
 * Subに紐づくユーザーを取得する
 */
export async function getUserBySub(sub: string): Promise<User> {
  try {
    const result = await sql<User>`
      SELECT * FROM users WHERE sub = ${sub}
    `;

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}
