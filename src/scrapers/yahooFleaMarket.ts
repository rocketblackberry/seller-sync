import { ScrapingResult } from "@/types";
import { Page } from "playwright-core";

const SELECTORS = {
  PRICE: [".ItemPrice__Component > span:nth-child(1)"],
  SHIPPING: [],
  OUT_OF_STOCK: [':has-text("関連商品をアプリで探す")'],
  STOCK: [':has-text("購入手続きへ")'],
} as const;

/** Yahoo!フリマをスクレイピングする */
export const scrapeYahooFleaMarket = async (
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
          const price = parseInt(priceText.replace(/[^\d]/g, ""), 10);

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
          const match = shippingText.match(/¥?(\d+)(?:(?:~|〜)\d+)?/);

          if (match) return parseInt(match[1].replace(/[^\d]/g, ""), 10);
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
