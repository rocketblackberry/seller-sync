import { Page } from "playwright";
import { ScrapingResult } from "../interfaces";

/** Amazonをスクレイピングする */
export const scrapeAmazon = async (
  page: Page,
  url: string,
  retries = 2
): Promise<ScrapingResult> => {
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    if (!response) {
      throw new Error(`Failed to load page: ${url}`);
    }

    // size
    const responseBody = await response.body();
    const responseByteSize = Buffer.byteLength(responseBody, "utf8");
    const size = Math.round(responseByteSize / 1024);

    // title
    const title = await page.title();

    // price
    const priceString = await page
      .locator("#corePrice_feature_div .a-price-whole")
      .first()
      .innerText();
    const price = parseInt(priceString.replace(/,/g, ""), 10);

    // stock
    const stock = price > 0 ? 1 : 0;

    return { size, title, price, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeAmazon(page, url, retries - 1);
    } else {
      return {
        title: "",
        price: 0,
        stock: 0,
        size: 0,
        error: (error as Error).message || "",
      };
    }
  }
};
