import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

/** Amazonをスクレイピングする */
export const scrapeAmazon = async (
  page: Page,
  url: string,
  retries = 2,
): Promise<ScrapingResult> => {
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    if (!response) {
      throw new Error(`Failed to load page: ${url}`);
    }

    // price
    let price = 0;
    try {
      const priceString = await page
        .locator("#corePrice_feature_div .a-price-whole")
        .first()
        .innerText();
      price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      // console.error(e);
      throw e;
    }

    // shipping
    // TODO: 実装する

    // stock
    let stock = 0;
    try {
      const outOfStock = await page
        .locator('#availability > span:has-text("一時的に在庫切れ")')
        .first();
      const outOfStockDelayed = await page
        .locator('#availability > span:has-text("以内に発送")')
        .first();
      stock =
        price == 0 ||
        (await outOfStock.count()) > 0 ||
        (await outOfStockDelayed.count()) > 0
          ? 0
          : 1;
    } catch (e) {
      // console.error(e);
      throw e;
    }

    return { price, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeAmazon(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "",
      };
    }
  }
};
