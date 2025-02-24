import { Item, Status } from "@/types";
import { sql } from "@vercel/postgres";

type Condition = {
  keyword?: string;
  status?: Status;
};

/**
 * セラーIDと検索条件に紐づく商品リストを取得する
 */
export async function getItems(
  sellerId: number,
  condition: Condition,
): Promise<Item[]> {
  const { keyword = "", status = "" } = condition;

  let query = sql<Item>`SELECT *, updated_at AT TIME ZONE 'UTC' as updated_at FROM items WHERE seller_id = ${sellerId}`;

  if (keyword) {
    query = sql<Item>`SELECT * FROM items WHERE title ILIKE ${
      "%" + keyword + "%"
    } AND seller_id = ${sellerId}`;
  }

  if (status) {
    query = sql<Item>`SELECT *, updated_at AT TIME ZONE 'UTC' as updated_at FROM items WHERE status = ${status} AND seller_id = ${sellerId}`;
  }

  if (keyword && status) {
    query = sql<Item>`SELECT *, updated_at AT TIME ZONE 'UTC' as updated_at FROM items WHERE title ILIKE ${
      "%" + keyword + "%"
    } AND status = ${status} AND seller_id = ${sellerId}`;
  }

  const result = await query;

  return result.rows;
}

/**
 * 商品を取得する
 */
export async function getItemById(id: string): Promise<Item | null> {
  const result = await sql<Item>`SELECT * FROM items WHERE id = ${id}`;

  return result.rows[0] || null;
}

/**
 * 商品を登録または更新する
 */
export async function upsertItem(item: Partial<Item>): Promise<Item | null> {
  try {
    const result = await sql<Item>`
      INSERT INTO items (
        id, seller_id, keyword, title, image, condition, description, description_ja, supplier_url, price, cost, weight, freight, profit, profit_rate, fvf_rate, promote_rate, stock, status, view, watch, sold
      ) VALUES (
        ${item.id},
        ${item.seller_id ?? null},
        ${item.keyword ?? "DEFAULT"},
        ${item.title ?? "DEFAULT"},
        ${item.image ?? "DEFAULT"},
        ${item.condition ?? "DEFAULT"},
        ${item.description ?? "DEFAULT"},
        ${item.description_ja ?? "DEFAULT"},
        ${item.supplier_url ?? "DEFAULT"},
        ${item.price ?? "DEFAULT"},
        ${item.cost ?? "DEFAULT"},
        ${item.weight ?? "DEFAULT"},
        ${item.freight ?? "DEFAULT"},
        ${item.profit ?? "DEFAULT"},
        ${item.profit_rate ?? "DEFAULT"},
        ${item.fvf_rate ?? "DEFAULT"},
        ${item.promote_rate ?? "DEFAULT"},
        ${item.stock ?? "DEFAULT"},
        ${item.status ?? "DEFAULT"},
        ${item.view ?? "DEFAULT"},
        ${item.watch ?? "DEFAULT"},
        ${item.sold ?? "DEFAULT"}
      ) ON CONFLICT (id) DO UPDATE SET
        seller_id = COALESCE(EXCLUDED.seller_id, items.seller_id),
        keyword = COALESCE(EXCLUDED.keyword, items.keyword),
        title = COALESCE(EXCLUDED.title, items.title),
        image = COALESCE(EXCLUDED.image, items.image),
        condition = COALESCE(EXCLUDED.condition, items.condition),
        description = COALESCE(EXCLUDED.description, items.description),
        description_ja = COALESCE(EXCLUDED.description_ja, items.description_ja),
        supplier_url = COALESCE(EXCLUDED.supplier_url, items.supplier_url),
        price = COALESCE(EXCLUDED.price, items.price),
        cost = COALESCE(EXCLUDED.cost, items.cost),
        weight = COALESCE(EXCLUDED.weight, items.weight),
        freight = COALESCE(EXCLUDED.freight, items.freight),
        profit = COALESCE(EXCLUDED.profit, items.profit),
        profit_rate = COALESCE(EXCLUDED.profit_rate, items.profit_rate),
        fvf_rate = COALESCE(EXCLUDED.fvf_rate, items.fvf_rate),
        promote_rate = COALESCE(EXCLUDED.promote_rate, items.promote_rate),
        stock = COALESCE(EXCLUDED.stock, items.stock),
        status = COALESCE(EXCLUDED.status, items.status),
        view = COALESCE(EXCLUDED.view, items.view),
        watch = COALESCE(EXCLUDED.watch, items.watch),
        sold = COALESCE(EXCLUDED.sold, items.sold),
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
export async function deleteItem(id: string): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
}
