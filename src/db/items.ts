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
 * 仕入れ用に商品リストを取得する
 */
export async function getSupplierItems(
  sellerId: number,
  pageNumber: number,
  perPage: number,
): Promise<Partial<Item>[]> {
  const offset = (pageNumber - 1) * perPage;
  const result = await sql<Partial<Item>>`
    SELECT id, seller_id, supplier_url, cost, stock, status
    FROM items
    WHERE seller_id = ${sellerId} AND stock > 0 AND status = 'active'
    ORDER BY created_at
    LIMIT ${perPage}
    OFFSET ${offset}
  `;

  return result.rows;
}

/**
 * 仕入れ用商品リストのカウントを取得する
 */
export async function getSupplierItemsCount(sellerId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM items
    WHERE seller_id = ${sellerId} AND stock > 0 AND status = 'active'
  `;
  const count = Number(result.rows[0]?.count ?? 0);

  return count;
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
    const entries = Object.entries(item).filter(
      ([, value]) => value !== undefined,
    );
    const columns = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    const updates = columns
      .filter((key) => key !== "id")
      .map((key) => `${key} = COALESCE(EXCLUDED.${key}, items.${key})`);

    const query = `
      INSERT INTO items (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT (id) DO UPDATE SET
        ${updates.join(", ")},
        updated_at = NOW()
      RETURNING *
    `;

    const result = await sql.query<Item>(query, values);

    return result.rows[0];
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item");
  }
}

/**
 * 商品を登録または更新する（バルク）
 */
export async function upsertItems(items: Partial<Item>[]): Promise<void> {
  try {
    if (items.length === 0) return;

    // 最初のアイテムからカラムを取得
    const firstItem = items[0];
    if (!firstItem) {
      throw new Error("First item is undefined");
    }
    const entries = Object.entries(firstItem).filter(
      ([, value]) => value !== undefined,
    );
    const columns = entries.map(([key]) => key);

    // 全アイテムのバリューを準備
    const allValues: (string | number | Date | null)[] = [];
    const valueBlocks: string[] = [];

    items.forEach((item, i) => {
      const values = columns.map(
        (column) => item![column as keyof Item] ?? null,
      );
      allValues.push(...values);
      const offset = i * columns.length;
      const placeholders = columns.map((_, j) => `$${offset + j + 1}`);
      valueBlocks.push(`(${placeholders.join(", ")})`);
    });

    // アップデート句を作成
    const updates = columns
      .filter((key) => key !== "id")
      .map((key) => `${key} = COALESCE(EXCLUDED.${key}, items.${key})`);

    const query = `
      INSERT INTO items (${columns.join(", ")})
      VALUES ${valueBlocks.join(", ")}
      ON CONFLICT (id) DO UPDATE SET
        ${updates.join(", ")},
        updated_at = NOW()
    `;

    await sql.query(query, allValues);
  } catch (error) {
    console.error("Error bulk updating items:", error);
    throw new Error("Failed to bulk update items");
  }
}

/**
 * 商品を削除する
 */
export async function deleteItem(id: string): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
}
