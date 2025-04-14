import { getSupplierItems, getSupplierItemsCount } from "@/db";
import { getExchangeRate } from "@/db/exchanges";
import {
  scrapeAmazon,
  scrapeMercari,
  scrapeMercariShop,
  scrapeYahooFleaMarket,
  scrapeYahooShopping,
} from "@/scrapers";
import { calcPrice, calcProfit, detectSupplier } from "@/utils";
import chromium from "@sparticuz/chromium";
import playwright, { Page } from "playwright-core";
import { Item, ScrapingResult } from "../types";

export type ScrapingItem = Partial<Item> & { label: string };

export type GetScrapingItemsProps = {
  sellerId: number;
  pageNumber?: number;
  perPage?: number;
  errorOnly?: boolean;
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

/**
 * スクレイピング対象のアイテムを取得する
 */
export async function getScrapingItems({
  sellerId,
  pageNumber = 1,
  perPage = 100,
  errorOnly = false,
}: GetScrapingItemsProps): Promise<GetScrapingItemsType> {
  const items = await getSupplierItems(
    sellerId,
    pageNumber,
    perPage,
    errorOnly,
  );
  const totalItems = await getSupplierItemsCount(sellerId, errorOnly);
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

    const context = await browser.newContext({
      userAgent: process.env.USER_AGENT!,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true,
      bypassCSP: true,
    });

    // 必要なリソースのみ読み込む
    await context.route("**/*", (route) => {
      const request = route.request();
      const resourceType = request.resourceType();

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

    // ページ設定
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(30000);

    // バッチ処理（5件ずつ）
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(async (item) => {
        const { id, url } = item;
        const supplier = detectSupplier(url) ?? "";

        try {
          // await page.waitForTimeout(Math.random() * 2000 + 1000);
          return await scrapeWithRetry(page, url, supplier, id);
        } catch (error) {
          return {
            id,
            price: 0,
            stock: 0,
            error: (error as Error).message || "Unknown error",
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    await browser.close();

    return results;
  } catch (error) {
    throw new Error(`Failed to scrape items: ${(error as Error).message}`);
  }
}

// リトライ機能付きスクレイピング
async function scrapeWithRetry(
  page: Page,
  url: string,
  supplier: string,
  id: string,
  maxRetries = 3,
): Promise<ScrapeItemsType> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url, {
        waitUntil: "load", // networkidle or load
      });

      let result: ScrapingResult;
      switch (supplier) {
        case "amazon":
          result = await scrapeAmazon(page);
          break;
        case "mercari":
          result = await scrapeMercari(page);
          break;
        case "mercariShop":
          result = await scrapeMercariShop(page);
          break;
        /* case "yahooAuction":
          result = await scrapeYahooAuction(page);
          break; */
        case "yahooFleaMarket":
          result = await scrapeYahooFleaMarket(page);
          break;
        case "yahooShopping":
          result = await scrapeYahooShopping(page);
          break;
        /* case "yodobashi":
          result = await scrapeYodobashi(page);
          break; */
        default:
          result = { price: 0, stock: 0, error: "Unsupported supplier" };
      }

      return { id, ...result };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Retry ${i + 1}/${maxRetries} failed for ${id}:`);
      await page.waitForTimeout(1000 * (i + 1)); // 指数バックオフ
    }
  }

  return {
    id,
    price: 0,
    stock: 0,
    error: lastError?.message || "Maximum retries exceeded",
  };
}

/**
 * スクレイピングの処理結果をマージする
 */
export async function mergeItems(
  items: Partial<Item>[],
  result: ScrapeItemsType[],
): Promise<ScrapingItem[]> {
  const exchangeRate = await getExchangeRate();
  const now = new Date();

  return items.map((item) => {
    const scraped = result.find((scrapedItem) => scrapedItem.id === item.id);

    if (!scraped) {
      return { ...item, label: "failed" };
    }

    const cost = scraped.price ?? 0;
    const price =
      cost &&
      item.freight &&
      item.profit_rate &&
      item.fvf_rate &&
      item.promote_rate &&
      exchangeRate
        ? calcPrice(
            cost,
            item.freight,
            item.profit_rate,
            item.fvf_rate,
            item.promote_rate,
            exchangeRate,
          )
        : 0;
    const profit =
      price &&
      cost &&
      item.freight &&
      item.fvf_rate &&
      item.promote_rate &&
      exchangeRate
        ? calcProfit(
            price,
            cost,
            item.freight,
            item.fvf_rate,
            item.promote_rate,
            exchangeRate,
          )
        : 0;
    const stock = scraped.stock ?? 0;

    return {
      ...item,
      price,
      cost,
      profit,
      stock,
      scrape_error: scraped.error ? (item.scrape_error ?? 0) + 1 : 0,
      scraped_at: now,
      updated_at: now,
      label: scraped.error ? "verified" : "updated",
    };
  });
}

const times: { [key: string]: number } = {};

export const startTimer = (label: string) => {
  if (process.env.NODE_ENV === "production") return;

  times[label] = performance.now();
};

export const endTimer = (label: string, counter?: number) => {
  if (process.env.NODE_ENV === "production") return;

  const duration = performance.now() - times[label];
  console.log(
    `${label}${counter ? `(${counter})` : ""}: ${duration.toFixed(2)}ms`,
  );
};
