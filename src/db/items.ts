import { Item } from "@/interfaces/item";
import { sql } from "@vercel/postgres";

type Condition = {
  keyword?: string;
  status?: string;
};

/**
 * セラーIDと検索条件に紐づく商品リストを取得する
 */
export async function getItems(
  sellerId: number,
  condition: Condition,
): Promise<Item[]> {
  const { keyword = "", status = "" } = condition;

  let query = sql<Item>`SELECT * FROM items WHERE seller_id = ${sellerId}`;

  if (keyword) {
    query = sql<Item>`SELECT * FROM items WHERE title ILIKE ${
      "%" + keyword + "%"
    } AND seller_id = ${sellerId}`;
  }

  if (status) {
    query = sql<Item>`SELECT * FROM items WHERE status = ${status} AND seller_id = ${sellerId}`;
  }

  if (keyword && status) {
    query = sql<Item>`SELECT * FROM items WHERE title ILIKE ${
      "%" + keyword + "%"
    } AND status = ${status} AND seller_id = ${sellerId}`;
  }

  const result = await query;

  return result.rows;
}

/**
 * 商品を取得する
 */
export async function getItemById(id: number): Promise<Item | null> {
  const result = await sql<Item>`SELECT * FROM items WHERE id = ${id}`;

  return result.rows[0] || null;
}

/**
 * 商品を登録または更新する
 */
export async function upsertItem(item: Item): Promise<Item | null> {
  try {
    const itemId =
      !item.item_id || item.item_id.trim() === "" ? null : item.item_id;

    const result = await sql<Item>`
      INSERT INTO items (
        seller_id, item_id, keyword, title, condition, description, description_ja, supplier_url, price, cost, weight, freight, profit, profit_rate, fvf_rate, promote_rate, stock, status, updated_at
      ) VALUES (
        ${item.seller_id}, ${itemId}, ${item.keyword}, ${item.title}, ${item.condition}, ${item.description}, ${item.description_ja}, ${item.supplier_url}, ${item.price}, ${item.cost}, ${item.weight}, ${item.freight}, ${item.profit}, ${item.profit_rate}, ${item.fvf_rate}, ${item.promote_rate}, ${item.stock}, ${item.status}, NOW()
      ) ON CONFLICT (item_id) DO UPDATE SET
        seller_id = EXCLUDED.seller_id,
        keyword = EXCLUDED.keyword,
        title = EXCLUDED.title,
        condition = EXCLUDED.condition,
        description = EXCLUDED.description,
        description_ja = EXCLUDED.description_ja,
        supplier_url = EXCLUDED.supplier_url,
        price = EXCLUDED.price,
        cost = EXCLUDED.cost,
        weight = EXCLUDED.weight,
        freight = EXCLUDED.freight,
        profit = EXCLUDED.profit,
        profit_rate = EXCLUDED.profit_rate,
        fvf_rate = EXCLUDED.fvf_rate,
        promote_rate = EXCLUDED.promote_rate,
        stock = EXCLUDED.stock,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item");
  }
}

/**
 * 商品を削除する
 */
export async function deleteItem(id: number): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
}
