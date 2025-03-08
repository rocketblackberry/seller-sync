import { getSupplierItems, getSupplierItemsCount } from "@/db";
import { getExchangeRate } from "@/db/exchanges";
import {
  scrapeAmazon,
  scrapeMercari,
  scrapeMercariShop,
  scrapeYahooAuction,
  scrapeYahooFleaMarket,
  scrapeYahooShopping,
} from "@/scrapers";
import { calcPrice, calcProfit, detectSupplier } from "@/utils";
import chromium from "@sparticuz/chromium";
import playwright from "playwright-core";
import { Item, ScrapingResult } from "../types";

export type GetScrapingItemsProps = {
  sellerId: number;
  pageNumber?: number;
  perPage?: number;
};

export type GetScrapingItemsType = {
  items: Partial<Item>[];
  pageNumber: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
};

export type ScrapeItemsProps = {
  items: {
    id: string;
    url: string;
  }[];
};

export type ScrapeItemsType = {
  id: string;
  price: number;
  stock: number;
  error?: string;
};

export type ChangedItem = {
  id: string;
  seller_id: number;
  price: number;
  cost: number;
  profit: number;
  stock: number;
};

export type UnchangedItem = {
  id: string;
  seller_id: number;
};

export type FailedItem = {
  id: string;
  seller_id: number;
  error: string;
};

/**
 * スクレイピング対象のアイテムを取得する
 */
export async function getScrapingItems({
  sellerId,
  pageNumber = 1,
  perPage = 100,
}: GetScrapingItemsProps): Promise<GetScrapingItemsType> {
  const items = await getSupplierItems(sellerId, pageNumber, perPage);
  const totalItems = await getSupplierItemsCount(sellerId);
  const totalPages = Math.ceil(totalItems / perPage);
  const response = {
    items,
    pageNumber,
    perPage,
    totalItems,
    totalPages,
    hasMore: pageNumber < totalPages,
  };

  return response;
}

/**
 * スクレイピング対象のアイテムをスクレイピングする
 */
export async function scrapeItems({
  items,
}: ScrapeItemsProps): Promise<ScrapeItemsType[]> {
  try {
    const executablePath =
      process.env.NODE_ENV === "production"
        ? await chromium.executablePath()
        : undefined;
    const browser = await playwright.chromium.launch({
      executablePath,
      headless: true,
      args: [
        ...chromium.args,
        "--blink-settings=imagesEnabled=false",
        "--disable-remote-fonts",
        // "--disable-plugins",
        // "--disable-background-networking",
        // "--disable-sync",
        // "--disable-preconnect",
        // "--disable-notifications",
        // "--mute-audio",
        // "--disk-cache-size=0",
        // "--no-sandbox",
        // "--disable-dev-shm-usage",
        // "--no-zygote",
      ],
      proxy: {
        server: process.env.PROXY_SERVER!,
        username: process.env.PROXY_USERNAME!,
        password: process.env.PROXY_PASSWORD!,
      },
    });

    const context = await browser.newContext();
    await context.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      if (
        resourceType === "document" ||
        resourceType === "script" ||
        resourceType === "fetch" ||
        resourceType === "xhr"
      ) {
        route.continue();
      } else {
        route.abort();
      }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(3000);

    const results = [];
    for (const item of items) {
      const { id, url } = item;
      const supplier = detectSupplier(url);

      let result: ScrapingResult;
      try {
        switch (supplier) {
          case "amazon":
            result = await scrapeAmazon(page, url);
            break;
          case "mercari":
            result = await scrapeMercari(page, url);
            break;
          case "mercariShop":
            result = await scrapeMercariShop(page, url);
            break;
          case "yahooAuction":
            result = await scrapeYahooAuction(page, url);
            break;
          case "yahooFleaMarket":
            result = await scrapeYahooFleaMarket(page, url);
            break;
          case "yahooShopping":
            result = await scrapeYahooShopping(page, url);
            break;
          default:
            result = { price: 0, stock: 0, error: "Unsupported supplier" };
        }
      } catch (error) {
        result = {
          price: 0,
          stock: 0,
          error: (error as Error).message ?? "Unknown error",
        };
      }
      results.push({ id, ...result });
    }

    await browser.close();

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape items: ${(error as Error).message}`);
  }
}

/**
 * データベースのアイテムとスクレイピング結果を比較する
 */
export async function classifyItems(
  scrapingItems: Partial<Item>[], // アクティブかつ在庫ありのアイテム
  scrapedItems: ScrapeItemsType[], // スクレイピングしたアイテム　→更新対象
): Promise<{
  changedItems: ChangedItem[];
  unchangedItems: UnchangedItem[];
  failedItems: FailedItem[];
}> {
  const exchangeRate = await getExchangeRate();
  const changedItems: ChangedItem[] = [];
  const unchangedItems: UnchangedItem[] = [];
  const failedItems: FailedItem[] = [];

  scrapedItems.forEach((scraped) => {
    const scraping = scrapingItems.find(
      (scrapingItem) => scrapingItem.id === scraped.id,
    );

    if (scraped.error) {
      failedItems.push({
        id: scraped.id,
        seller_id: scraping!.seller_id!,
        error: scraped.error,
      });

      return;
    }

    const { price, cost, freight, profit_rate, fvf_rate, promote_rate, stock } =
      scraping!;

    const hasPriceChanged =
      scraped.price &&
      scraped.price !== cost &&
      freight &&
      profit_rate &&
      fvf_rate &&
      promote_rate;
    const hasStockChanged = scraped.stock && scraped.stock !== stock;

    if (hasPriceChanged || hasStockChanged) {
      const calculatedPrice =
        calcPrice(
          scraped.price,
          freight ?? 0,
          profit_rate ?? 0,
          fvf_rate ?? 0,
          promote_rate ?? 0,
          exchangeRate,
        ) ||
        price ||
        0;
      const calculatedCost = scraped.price || cost || 0;
      const calculatedProfit = calcProfit(
        calculatedPrice,
        calculatedCost,
        freight ?? 0,
        fvf_rate ?? 0,
        promote_rate ?? 0,
        exchangeRate,
      );
      const calculatedStock = scraped.stock || stock || 0;

      changedItems.push({
        id: scraped.id,
        seller_id: scraping!.seller_id!,
        price: calculatedPrice,
        cost: calculatedCost,
        profit: calculatedProfit,
        stock: calculatedStock,
      });

      return;
    }

    unchangedItems.push({ id: scraped.id, seller_id: scraping!.seller_id! });
  });

  return {
    changedItems: changedItems,
    unchangedItems: unchangedItems,
    failedItems: failedItems,
  };
}
