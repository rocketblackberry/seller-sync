import { sql } from "@vercel/postgres";
import { User } from "@/interfaces";

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
