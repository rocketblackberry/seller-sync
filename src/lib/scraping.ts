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

export type ScrapingItem = Partial<Item> & { label: string };

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

    const context = await browser.newContext({
      userAgent: process.env.USER_AGENT!,
    });
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
    page.setDefaultTimeout(5000);
    page.setDefaultNavigationTimeout(10000);

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
          /* case "yodobashi":
            result = await scrapeYodobashi(page, url);
            break; */
          default:
            result = { price: 0, stock: 0, error: "Unsupported supplier" };
        }
      } catch (error) {
        result = {
          price: 0,
          stock: 0,
          error: (error as Error).message || "Unknown error",
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

    if (scraped.error) {
      return {
        ...item,
        price: 0,
        cost: 0,
        profit: 0,
        stock: 0,
        scrape_error: (item.scrape_error ?? 0) + 1,
        scraped_at: now,
        updated_at: now,
        label: "verified",
      };
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
      scrape_error: 0,
      scraped_at: now,
      updated_at: now,
      label: "updated",
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
