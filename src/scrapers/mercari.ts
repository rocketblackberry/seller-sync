import { Page } from "playwright";
import { ScrapingResult } from "../interfaces";

/** メルカリをスクレイピングする */
export const scrapeMercari = async (
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
      .locator(
        "#item-info > section:nth-child(1) > section:nth-child(2) > div > div > div > span:nth-child(2)"
      )
      .first()
      .innerText();
    const price = parseInt(priceString.replace(/,/g, ""), 10);

    // stock
    const stockButton = await page
      .locator('button[type="button"][disabled]:has-text("売り切れました")')
      .first();
    const stock = (await stockButton.count()) > 0 ? 0 : 1;

    return { size, title, price, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeMercari(page, url, retries - 1);
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
