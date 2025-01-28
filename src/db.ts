import { sql } from "@vercel/postgres";
import { Item } from "@/interfaces";

export async function getItems(): Promise<Item[]> {
  const result = await sql<Item>`SELECT * FROM items`;
  return result.rows;
}

export async function getItemById(id: number): Promise<Item | null> {
  const result = await sql<Item>`SELECT * FROM items WHERE id = ${id}`;
  return result.rows[0] || null;
}

export async function updateItem(item: Partial<Item>): Promise<Item | null> {
  const itemId =
    !item.item_id || item.item_id.trim() === "" ? null : item.item_id;
  try {
    const result = await sql<Item>`
      INSERT INTO items (
        item_id, keyword, title, image, condition, description, description_ja, supplier_url, price, cost, weight, freight, profit, profit_rate, fvf_rate, promote_rate, stock, status, view, watch, sold
      ) VALUES (
        ${itemId}, ${item.keyword}, ${item.title}, ${item.image}, ${item.condition}, ${item.description}, ${item.description_ja}, ${item.supplier_url}, ${item.price}, ${item.cost}, ${item.weight}, ${item.freight}, ${item.profit}, ${item.profit_rate}, ${item.fvf_rate}, ${item.promote_rate}, ${item.stock}, ${item.status}, ${item.view}, ${item.watch}, ${item.sold}
      ) ON CONFLICT (item_id) DO UPDATE SET
        keyword = EXCLUDED.keyword,
        title = EXCLUDED.title,
        image = EXCLUDED.image,
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
        view = EXCLUDED.view,
        watch = EXCLUDED.watch,
        sold = EXCLUDED.sold
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item");
  }
}

export async function deleteItem(id: number): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
}
