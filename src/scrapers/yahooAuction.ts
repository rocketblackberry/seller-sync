import { endTimer, startTimer } from "@/lib/scraping";
import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

/** Yahoo!オークションをスクレイピングする */
export const scrapeYahooAuction = async (
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

    // price（オークション | 即決 | 併用の3パターンに対応）
    startTimer("price");
    let price = 0;
    // 即決価格がある場合
    try {
      const priceString = await page
        .locator(".Price__value--buyNow > .Price__tax")
        .first()
        .innerText();
      const match = priceString.match(/(\d{1,3}(,\d{3})*)円/);
      if (match) {
        price = parseInt(match[1].replace(/[^\d]/g, ""), 10);
      } else {
        price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
      }
    } catch {}

    // 税込価格がある場合
    if (price === 0) {
      try {
        const priceString = await page
          .locator(".Price__value > .Price__tax")
          .first()
          .innerText();
        const match = priceString.match(/(\d{1,3}(,\d{3})*)円/);
        if (match) {
          price = parseInt(match[1].replace(/[^\d]/g, ""), 10);
        } else {
          price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
        }
      } catch {}
    }

    // 税込価格がない場合
    if (price === 0) {
      try {
        const priceString = await page
          .locator(".Price__value")
          .first()
          .innerText();
        const match = priceString.match(/(\d{1,3}(,\d{3})*)円/);
        if (match) {
          price = parseInt(match[1].replace(/[^\d]/g, ""), 10);
        } else {
          price = parseInt(priceString.replace(/[^\d]/g, ""), 10);
        }
      } catch (e) {
        throw e;
      }
    }
    endTimer("price", counter);

    // shipping
    startTimer("shipping");
    // 落札者負担の場合（1000円とする）
    let shipping = 0;
    try {
      const shippingString = await page
        .locator('.Price__postageValue:has-text("落札者負担")')
        .first();
      shipping = (await shippingString.count()) > 0 ? 1000 : 0;
    } catch {}

    // 送料が設定されている場合
    if (shipping === 0) {
      try {
        const shippingString = await page
          .locator(".Price__postageValue--bold")
          .first()
          .innerText();
        shipping = parseInt(shippingString.replace(/[^\d]/g, ""), 10);
      } catch {}
    }
    endTimer("shipping", counter);

    // stock
    startTimer("stock");
    let stock = 0;
    try {
      const closedHeader = await page.locator("#closedHeader").first();
      stock = (await closedHeader.count()) > 0 ? 0 : 1;
    } catch {}
    endTimer("stock", counter);

    return { price: Number(price) + Number(shipping), stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeYahooAuction(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
};
