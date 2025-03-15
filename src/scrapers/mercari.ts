import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

/** メルカリをスクレイピングする */
export const scrapeMercari = async (
  page: Page,
  url: string,
  retries = 2,
): Promise<ScrapingResult> => {
  try {
    console.time("mercari.goto");
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    console.timeEnd("mercari.goto");

    if (!response) {
      throw new Error(`Failed to load page: ${url}`);
    }

    console.time("mercari.scraping");
    // price
    let price = 0;
    try {
      const priceString = await page
        .locator(
          "#item-info > section:nth-child(1) > section:nth-child(2) > div > div > div > span:nth-child(2)",
        )
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
        .locator('button[type="button"][disabled]:has-text("売り切れました")')
        .first();
      stock = (await outOfStock.count()) > 0 ? 0 : 1;
    } catch (e) {
      // console.error(e);
      throw e;
    }
    console.timeEnd("mercari.scraping");

    return { price, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeMercari(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
};
