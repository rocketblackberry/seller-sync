import { endTimer, startTimer } from "@/lib/scraping";
import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

/** Amazonをスクレイピングする */
export const scrapeAmazon = async (
  page: Page,
  url: string,
  retries = 2,
): Promise<ScrapingResult> => {
  const counter = 3 - retries;

  try {
    startTimer("goto");
    const response = await page.goto(url, { waitUntil: "load" });
    endTimer("goto", counter);

    if (!response) {
      throw new Error(`Failed to load page: ${url}`);
    }

    // price
    startTimer("price");
    let price = 0;
    try {
      const priceString = await page
        .locator("#corePrice_feature_div .a-price-whole") // TODO: 取れない場合がある。改善の余地あり
        .first()
        .innerText();
      price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      throw e;
    }
    endTimer("price", counter);

    // shipping
    // TODO: 実装する

    // stock
    let stock = 0;
    startTimer("stock");
    try {
      const outOfStock = await page
        .locator('#availability > span:has-text("一時的に在庫切れ")')
        .first();
      const outOfStockDelayed = await page
        .locator('#availability > span:has-text("以内に発送")')
        .first();
      stock =
        (await outOfStock.count()) > 0 || (await outOfStockDelayed.count()) > 0
          ? 0
          : 1;
    } catch {}
    endTimer("stock", counter);

    return { price, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeAmazon(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
};
