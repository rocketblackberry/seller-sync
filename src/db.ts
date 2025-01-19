import { sql } from "@vercel/postgres";
import { Item } from "./interfaces";

export async function getItems(): Promise<Item[]> {
  const result = await sql<Item>`SELECT * FROM items`;

  return result.rows;
}

export async function getItemById(id: number): Promise<Item | null> {
  const result = await sql<Item>`SELECT * FROM items WHERE id = ${id}`;

  return result.rows[0] || null;
}

export async function addItem(
  item: Omit<Item, "id" | "createdAt" | "updatedAt" | "syncedAt">
): Promise<Item> {
  try {
    const result = await sql<Item>`
      INSERT INTO items (
        ebay_id, source_ebay_id, maker, name, title, description, images, condition, condition_description, category_id, specs, price, stock, supplier, supplier_url, cost, weight, freight, shipping_policy, promote, status, view, watch, sold
      ) VALUES (
        ${item.ebay_id}, ${item.source_ebay_id}, ${item.maker}, ${item.name}, ${
      item.title
    }, ${item.description}, ${
      item.images && item.images.length > 0 ? JSON.stringify(item.images) : "{}"
    }, ${item.condition}, ${item.condition_description}, ${item.category_id}, ${
      item.specs && item.specs.length > 0 ? JSON.stringify(item.specs) : "{}"
    }, ${item.price}, ${item.stock}, ${item.supplier}, ${item.supplier_url}, ${
      item.cost
    }, ${item.weight}, ${Math.trunc(item.freight)}, ${item.shipping_policy}, ${
      item.promote
    }, ${item.status}, ${item.view}, ${item.watch}, ${item.sold}
      ) RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error("Error adding item:", error);
    throw new Error("Failed to add item");
  }
}

export async function updateItem(
  id: number,
  item: Partial<Omit<Item, "id" | "createdAt" | "updatedAt" | "syncedAt">>
): Promise<Item> {
  try {
    const result = await sql<Item>`
      UPDATE items SET
        ebay_id = COALESCE(${item.ebay_id}, ebay_id),
        source_ebay_id = COALESCE(${item.source_ebay_id}, source_ebay_id),
        maker = COALESCE(${item.maker}, maker),
        name = COALESCE(${item.name}, name),
        title = COALESCE(${item.title}, title),
        description = COALESCE(${item.description}, description),
        images = COALESCE(${
          item.images && item.images.length > 0
            ? JSON.stringify(item.images)
            : "{}"
        }, images),
        condition = COALESCE(${item.condition}, condition),
        condition_description = COALESCE(${
          item.condition_description
        }, condition_description),
        category_id = COALESCE(${item.category_id}, category_id),
        specs = COALESCE(${
          item.specs && item.specs.length > 0
            ? JSON.stringify(item.specs)
            : "{}"
        }, specs),
        price = COALESCE(${item.price}, price),
        stock = COALESCE(${item.stock}, stock),
        supplier = COALESCE(${item.supplier}, supplier),
        supplier_url = COALESCE(${item.supplier_url}, supplier_url),
        cost = COALESCE(${item.cost}, cost),
        weight = COALESCE(${item.weight}, weight),
        freight = COALESCE(${item.freight}, freight),
        shipping_policy = COALESCE(${item.shipping_policy}, shipping_policy),
        promote = COALESCE(${item.promote}, promote),
        status = COALESCE(${item.status}, status),
        view = COALESCE(${item.view}, view),
        watch = COALESCE(${item.watch}, watch),
        sold = COALESCE(${item.sold}, sold)
      WHERE id = ${id}
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
