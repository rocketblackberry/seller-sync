import { Page } from "playwright";
import { ScrapingResult } from "../interfaces";

/** Yahoo!フリマをスクレイピングする */
export const scrapeYahooFleaMarket = async (
  page: Page,
  url: string,
  retries = 2
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
          "#product-info > section:nth-child(1) > section:nth-child(2) > div > div > span:nth-child(2)"
        )
        .first()
        .innerText();
      price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      console.log(e);
    }

    // shipping
    let shipping = 0;
    try {
      const shippingString = await page
        .locator(".ItemPrice__Component > span:nth-child(1)")
        .first()
        .innerText();
      shipping = parseInt(shippingString.replace(/[^\d]/g, ""), 10);
    } catch (e) {
      console.log(e);
    }

    // stock
    let stock = 0;
    try {
      const buyButton = await page.locator("#item_buy_button").first();
      stock = (await buyButton.count()) > 0 ? 1 : 0;
    } catch (e) {
      console.log(e);
    }

    return { price: price + shipping, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeYahooFleaMarket(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "",
      };
    }
  }
};
