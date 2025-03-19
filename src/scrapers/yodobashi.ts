import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

/** ヨドバシカメラをスクレイピングする */
export const scrapeYodobashi = async (
  page: Page,
  url: string,
  retries = 2,
): Promise<ScrapingResult> => {
  try {
    console.time("page.goto");
    const response = await page.goto(url, { waitUntil: "load" });
    console.timeEnd("page.goto");

    if (!response) {
      throw new Error(`Failed to load page: ${url}`);
    }

    console.time("page.locator");
    // price
    let price = 0;
    try {
      await page.waitForSelector(".productPrice");
      const priceString = await page
        .locator(".productPrice")
        .first()
        .innerText();
      price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      throw e;
    }
    console.timeEnd("page.locator");

    // shipping
    const shipping = 0;
    /* try {
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
    } */

    // stock
    const stock = 0;
    /* try {
      const buyButton = await page
        .locator('span:has-text("カートに入れる")')
        .first();
      stock = (await buyButton.count()) > 0 ? 1 : 0;
    } catch (e) {
      // console.error(e);
      throw e;
    } */

    return { price: price + shipping, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeYodobashi(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
};
