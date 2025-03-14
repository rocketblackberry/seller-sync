import { Item } from "@/types";
import { sql } from "@vercel/postgres";

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
    SELECT id, seller_id, url, price, cost, freight, profit, profit_rate, fvf_rate, promote_rate, stock, scrape_error, scraped_at
    FROM items
    WHERE seller_id = ${sellerId} AND url <> '' AND status = 'active' AND scrape_error < 3
    ORDER BY url
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
    WHERE seller_id = ${sellerId} AND url <> '' AND status = 'active AND scrape_error < 3'
  `;
  const count = Number(result.rows[0]?.count ?? 0);

  return count;
}
