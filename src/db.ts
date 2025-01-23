import { sql } from "@vercel/postgres";
import { Item, ItemDB } from "@/interfaces";

export async function getItems(): Promise<Item[]> {
  const result = await sql<ItemDB>`SELECT * FROM items`;
  return result.rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    keyword: row.keyword,
    title: row.title,
    image: row.image,
    condition: row.condition,
    description: row.description,
    descriptionJa: row.description_ja,
    supplierUrl: row.supplier_url,
    price: row.price,
    cost: row.cost,
    weight: row.weight,
    freight: row.freight,
    profit: row.profit,
    profitRate: row.profit_rate,
    fvfRate: row.fvf_rate,
    promoteRate: row.promote_rate,
    stock: row.stock,
    status: row.status,
    view: row.view,
    watch: row.watch,
    sold: row.sold,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getItemById(id: number): Promise<Item | null> {
  const result = await sql<Item>`SELECT * FROM items WHERE id = ${id}`;
  return result.rows[0] || null;
}

export async function updateItem(item: Partial<Item>): Promise<Item | null> {
  const itemId = !item.itemId || item.itemId.trim() === "" ? null : item.itemId;
  try {
    const result = await sql<Item>`
      INSERT INTO items (
        item_id, keyword, title, image, condition, description, description_ja, supplier_url, price, cost, weight, freight, profit, profit_rate, fvf_rate, promote_rate, stock, status, view, watch, sold
      ) VALUES (
        ${itemId}, ${item.keyword}, ${item.title}, ${item.image}, ${item.condition}, ${item.description}, ${item.descriptionJa}, ${item.supplierUrl}, ${item.price}, ${item.cost}, ${item.weight}, ${item.freight}, ${item.profit}, ${item.profitRate}, ${item.fvfRate}, ${item.promoteRate}, ${item.stock}, ${item.status}, ${item.view}, ${item.watch}, ${item.sold}
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
