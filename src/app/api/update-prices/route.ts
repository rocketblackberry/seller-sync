import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { chromium } from "playwright";
import { Item } from "@/interfaces";
import {
  scrapeAmazon,
  scrapeMercari,
  scrapeMercariShop,
  scrapeYahooAuction,
  scrapeYahooFleaMarket,
  scrapeYahooShopping,
} from "@/scrapers";
import { detectSupplier } from "@/utils";
import rows from "./items.json";

export async function GET() {
  try {
    /* const { rows }: { rows: Item[] } =
      await sql`SELECT id, supplier_url FROM items`; */

    const browser = await chromium.launch({
      headless: true,
      args: [
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
        server: process.env.PROXY_SERVER || "",
        username: process.env.PROXY_USERNAME || "",
        password: process.env.PROXY_PASSWORD || "",
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
    for (const row of rows) {
      const { id, supplier_url } = row;
      const supplier = detectSupplier(supplier_url);

      let result;
      switch (supplier) {
        case "amazon":
          result = await scrapeAmazon(page, supplier_url);
          break;
        case "mercari":
          result = await scrapeMercari(page, supplier_url);
          break;
        case "mercariShop":
          result = await scrapeMercariShop(page, supplier_url);
          break;
        case "yahooAuction":
          result = await scrapeYahooAuction(page, supplier_url);
          break;
        case "yahooFleaMarket":
          result = await scrapeYahooFleaMarket(page, supplier_url);
          break;
        case "yahooShopping":
          result = await scrapeYahooShopping(page, supplier_url);
          break;
        default:
      }
      results.push({ id, ...result });
    }

    await browser.close();

    return NextResponse.json(
      { message: "Prices updated successfully", results },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { message: "Error updating prices", error },
      { status: 500 }
    );
  }
}
