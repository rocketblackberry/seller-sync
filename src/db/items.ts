import { Item, SortDirection, Status } from "@/types";
import { sql } from "@vercel/postgres";

// ページネーションのパラメータを含む検索条件の型
type SearchParams = {
  keyword?: string;
  status?: Status;
  sort: string;
  order: SortDirection;
  page: number;
  itemsPerPage: number;
};

// getItemsの戻り値の型
type GetItemsResult = {
  items: Item[];
  totalItems: number;
  totalPages: number;
};

/**
 * 商品リストを取得する
 */
export async function getItems(
  sellerId: number,
  params: SearchParams,
): Promise<GetItemsResult> {
  const {
    keyword = "",
    status = "",
    sort = "updated_at",
    order = "descending",
    page = 1,
    itemsPerPage = 50,
  } = params;
  const offset = (page - 1) * itemsPerPage;

  // ベースとなるWHERE句を構築
  const conditions = ["seller_id = $1"];
  const values: (number | string)[] = [sellerId];
  let paramCount = 1;

  if (keyword) {
    paramCount++;
    conditions.push(`title ILIKE $${paramCount}`);
    values.push(`%${keyword}%`);
  }

  if (status) {
    paramCount++;
    conditions.push(`status = $${paramCount}`);
    values.push(status);
  }

  // 総アイテム数を取得するクエリ
  const countQuery = `
    SELECT COUNT(*) as total
    FROM items
    WHERE ${conditions.join(" AND ")}
  `;

  // アイテムを取得するクエリ
  const itemsQuery = `
    SELECT *
    FROM items
    WHERE ${conditions.join(" AND ")}
    ORDER BY "${sort}" ${order === "descending" ? "DESC" : "ASC"}
    LIMIT $${++paramCount}
    OFFSET $${++paramCount}
  `;

  try {
    // 総件数を取得
    const countResult = await sql.query(countQuery, values);
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // アイテムを取得（LIMIT、OFFSETのパラメータを追加）
    const itemsResult = await sql.query<Item>(itemsQuery, [
      ...values,
      itemsPerPage,
      offset,
    ]);

    return {
      items: itemsResult.rows,
      totalItems,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new Error("商品の取得に失敗しました");
  }
}

/**
 * 商品を取得する
 */
export async function getItem(id: string): Promise<Item | null> {
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
        ${updates.join(", ")}
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
    const updates = columns.map(
      (key) => `${key} = COALESCE(EXCLUDED.${key}, items.${key})`,
    );

    const query = `
      INSERT INTO items (${columns.join(", ")})
      VALUES ${valueBlocks.join(", ")}
      ON CONFLICT (id) DO UPDATE SET
        ${updates.join(", ")}
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
