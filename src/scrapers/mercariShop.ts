import { ScrapingResult } from "@/types";
import { Page } from "playwright";

/** メルカリショップをスクレイピングする */
export const scrapeMercariShop = async (
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
        .locator(
          "#product-info > section:nth-child(1) > section:nth-child(2) > div > div > span:nth-child(2)",
        )
        .first()
        .innerText();
      price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      console.error(e);
      throw e;
    }

    // shipping
    let shipping = 0;
    try {
      const shippingString = await page
        .locator(
          "#product-info > section:nth-child(3) > div > div:nth-child(4) > div > span > div > span:nth-child(1)",
        )
        .first()
        .innerText();
      shipping = parseInt(shippingString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      console.error(e);
      throw e;
    }

    // stock
    let stock = 0;
    try {
      const outOfStock = await page
        .locator('p[data-testid="out-of-stock"]:has-text("売り切れ")')
        .first();
      stock = (await outOfStock.count()) > 0 ? 0 : 1;
    } catch (e) {
      console.error(e);
      throw e;
    }

    return { price: price + shipping, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeMercariShop(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "",
      };
    }
  }
};
