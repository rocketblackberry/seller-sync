import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

// NOTE: セレクタ要調整のため停止中
const SELECTORS = {
  PRICE: [
    ".Price__value--buyNow > .Price__tax", // 即決価格
    ".Price__value > .Price__tax", // 税込価格
    ".Price__value", // 通常価格
  ],
  SHIPPING: [
    '.Price__postageValue:has-text("落札者負担")', // 落札者負担
    ".Price__postageValue--bold", // 送料指定
    "#itemPostage > div > dl > dd > p > span",
  ],
  OUT_OF_STOCK: [
    "#closedHeader", // 終了商品
    "#closedNotice", // 終了商品
  ],
  STOCK: [
    'button[type="button"]:has-text("入札する")', // 即決ボタン
  ],
} as const;

/** Yahoo!オークションをスクレイピングする */
export const scrapeYahooAuction = async (
  page: Page,
): Promise<ScrapingResult> => {
  try {
    const [price, shipping, stock] = await Promise.all([
      getPrice(page),
      getShipping(page),
      getStock(page),
    ]);

    if (price === 0 || stock === 0) {
      return {
        price: price === 0 ? 0 : price + shipping,
        stock,
        error: price === 0 ? "Price not found" : "Out of stock",
      };
    }

    return {
      price: price + shipping,
      stock,
    };
  } catch (error) {
    return {
      price: 0,
      stock: 0,
      error: (error as Error).message || "Unknown error",
    };
  }
};

/** 価格を取得 */
async function getPrice(page: Page): Promise<number> {
  try {
    for (const selector of SELECTORS.PRICE) {
      try {
        await page.waitForSelector(selector, {
          state: "visible",
        });

        const element = await page.locator(selector).first();

        if (await element.count()) {
          const priceText = await element.innerText();
          const match = priceText.match(/(\d{1,3}(,\d{3})*)円/);
          const price = match
            ? parseInt(match[1].replace(/[^\d]/g, ""), 10)
            : parseInt(priceText.replace(/[^\d]/g, ""), 10);

          if (!isNaN(price) && price > 0) return price;
        }
      } catch {
        continue;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}

/** 送料を取得 */
async function getShipping(page: Page): Promise<number> {
  try {
    for (const selector of SELECTORS.SHIPPING) {
      try {
        await page.waitForSelector(selector, {
          state: "visible",
        });

        const element = await page.locator(selector).first();

        if (await element.count()) {
          const shippingText = await element.innerText();
          const match = shippingText.match(/(\d{1,3}(,\d{3})*)円/); // TODO: 要調整

          return match
            ? parseInt(shippingText.replace(/[^\d]/g, ""), 10)
            : 1000;
        }
      } catch {
        continue;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}

/** 在庫状態を取得 */
async function getStock(page: Page): Promise<number> {
  try {
    for (const selector of SELECTORS.OUT_OF_STOCK) {
      try {
        await page.waitForSelector(selector, {
          state: "visible",
        });

        return 0;
      } catch {
        continue;
      }
    }

    for (const selector of SELECTORS.STOCK) {
      try {
        await page.waitForSelector(selector, {
          state: "visible",
        });

        return 1;
      } catch {
        continue;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}
