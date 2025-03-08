import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

/** Yahoo!ショッピングをスクレイピングする */
export const scrapeYahooShopping = async (
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
        .locator('p[itemprop="price"]')
        .first()
        .innerText();
      price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      // console.error(e);
      throw e;
    }

    // shipping
    let shipping = 0;
    try {
      const shippingString = await page
        .locator('span:has-text("送料")')
        .first()
        .innerText();
      const match = shippingString.match(/(\d{1,3}(,\d{3})*)円/);
      if (match) {
        shipping = parseInt(match[1].replace(/[^\d]/g, ""), 10);
      }
    } catch (e) {
      // console.error(e);
      throw e;
    }

    // stock
    let stock = 0;
    try {
      const buyButton = await page
        .locator('span:has-text("カートに入れる")')
        .first();
      stock = (await buyButton.count()) > 0 ? 1 : 0;
    } catch (e) {
      // console.error(e);
      throw e;
    }

    return { price: price + shipping, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeYahooShopping(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "",
      };
    }
  }
};
