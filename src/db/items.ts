import { DEFAULT_ITEM } from "@/constants";
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
export async function getItemById(id: number): Promise<Item | null> {
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
        seller_id, item_id, keyword, title, image, condition, description, description_ja, supplier_url, price, cost, weight, freight, profit, profit_rate, fvf_rate, promote_rate, stock, status, view, watch, sold
      ) VALUES (
        ${item.seller_id ?? null},
        ${item.item_id?.trim() ?? DEFAULT_ITEM.item_id ?? null},
        ${item.keyword ?? DEFAULT_ITEM.keyword ?? null},
        ${item.title ?? DEFAULT_ITEM.title ?? null},
        ${item.image ?? DEFAULT_ITEM.image ?? null},
        ${item.condition ?? DEFAULT_ITEM.condition ?? null},
        ${item.description ?? DEFAULT_ITEM.description ?? null},
        ${item.description_ja ?? DEFAULT_ITEM.description_ja ?? null},
        ${item.supplier_url ?? DEFAULT_ITEM.supplier_url ?? null},
        ${item.price ?? DEFAULT_ITEM.price ?? null},
        ${item.cost ?? DEFAULT_ITEM.cost ?? null},
        ${item.weight ?? DEFAULT_ITEM.weight ?? null},
        ${item.freight ?? DEFAULT_ITEM.freight ?? null},
        ${item.profit ?? DEFAULT_ITEM.profit ?? null},
        ${item.profit_rate ?? DEFAULT_ITEM.profit_rate ?? null},
        ${item.fvf_rate ?? DEFAULT_ITEM.fvf_rate ?? null},
        ${item.promote_rate ?? DEFAULT_ITEM.promote_rate ?? null},
        ${item.stock ?? DEFAULT_ITEM.stock ?? null},
        ${item.status ?? DEFAULT_ITEM.status ?? null},
        ${item.view ?? DEFAULT_ITEM.view ?? null},
        ${item.watch ?? DEFAULT_ITEM.watch ?? null},
        ${item.sold ?? DEFAULT_ITEM.sold ?? null}
      ) ON CONFLICT (item_id) DO UPDATE SET
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
export async function deleteItem(id: number): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
}
