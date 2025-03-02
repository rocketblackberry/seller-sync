import { ScrapingResult } from "@/types";
import { Page } from "playwright";

/** Yahoo!オークションをスクレイピングする */
export const scrapeYahooAuction = async (
  page: Page,
  url: string,
  retries = 2,
): Promise<ScrapingResult> => {
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    if (!response) {
      throw new Error(`Failed to load page: ${url}`);
    }

    // price（オークション | 即決 | 併用の3パターンに対応）
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
    } catch (e) {
      console.error(e);
      throw e;
    }

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
      } catch (e) {
        console.error(e);
        throw e;
      }
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
        console.error(e);
        throw e;
      }
    }

    // shipping
    // 落札者負担の場合（1000円とする）
    let shipping = 0;
    try {
      const shippingString = await page
        .locator('.Price__postageValue:has-text("落札者負担")')
        .first();
      shipping = (await shippingString.count()) > 0 ? 1000 : 0;
    } catch (e) {
      console.error(e);
      throw e;
    }

    // 送料が設定されている場合
    if (shipping === 0) {
      try {
        const shippingString = await page
          .locator(".Price__postageValue--bold")
          .first()
          .innerText();
        shipping = parseInt(shippingString.replace(/[^\d]/g, ""), 10);
      } catch (e) {
        console.error(e);
        throw e;
      }
    }

    // stock
    let stock = 0;
    try {
      const closedHeader = await page.locator("#closedHeader").first();
      stock = (await closedHeader.count()) > 0 ? 0 : 1;
    } catch (e) {
      console.error(e);
      throw e;
    }

    return { price: price + shipping, stock };
  } catch (error) {
    if (retries > 0) {
      return scrapeYahooAuction(page, url, retries - 1);
    } else {
      return {
        price: 0,
        stock: 0,
        error: (error as Error).message || "",
      };
    }
  }
};
