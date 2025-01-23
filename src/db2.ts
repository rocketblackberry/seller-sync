import { sql } from "@vercel/postgres";
import { IItem2 } from "@/interfaces";

export async function getItems(): Promise<IItem2[]> {
  const result = await sql<IItem2>`SELECT * FROM items2`;
  return result.rows;
}

export async function getItemById(id: number): Promise<IItem2 | null> {
  const result = await sql<IItem2>`SELECT * FROM items2 WHERE id = ${id}`;
  return result.rows[0] || null;
}

export async function updateItem(item: Partial<IItem2>): Promise<IItem2> {
  const itemId =
    !item.item_id || item.item_id.trim() === "" ? null : item.item_id;

  try {
    const result = await sql<IItem2>`
      INSERT INTO items2 (
        item_id, keyword, title, image, condition, condition_description, price, stock, cost, weight, freight, promote, supplier_url, status, view, watch, sold
      ) VALUES (
        ${itemId}, ${item.keyword}, ${item.title}, ${item.image}, ${item.condition}, ${item.condition_description}, ${item.price}, ${item.stock}, ${item.cost}, ${item.weight}, ${item.freight}, ${item.promote}, ${item.supplier_url}, ${item.status}, ${item.view}, ${item.watch}, ${item.sold}
      ) ON CONFLICT (item_id) DO UPDATE SET
        keyword = EXCLUDED.keyword,
        title = EXCLUDED.title,
        image = EXCLUDED.image,
        condition = EXCLUDED.condition,
        condition_description = EXCLUDED.condition_description,
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        cost = EXCLUDED.cost,
        weight = EXCLUDED.weight,
        freight = EXCLUDED.freight,
        promote = EXCLUDED.promote,
        supplier_url = EXCLUDED.supplier_url,
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
  await sql`DELETE FROM items2 WHERE id = ${id}`;
}
