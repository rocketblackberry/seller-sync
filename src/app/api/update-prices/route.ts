import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { chromium } from "playwright";
import { PROXY_SERVER, PROXY_USERNAME, PROXY_PASSWORD } from "@/constants";
import { Item } from "@/interfaces";
import { scrapeAmazon, scrapeMercari, scrapeMercariShop } from "@/scrapers";
import { detectSupplier } from "@/utils";
import { request } from "http";

export async function GET() {
  try {
    /* const { rows }: { rows: Item[] } =
      await sql`SELECT id, supplier_url FROM items`; */

    const rows = [
      /* {
        id: 1,
        supplier_url: "https://jp.mercari.com/item/m95296759683",
      },
      {
        id: 2,
        supplier_url: "https://jp.mercari.com/item/m52426752496",
      }, */
      {
        id: 3, // 2750 + 350 = 3100、在庫なし
        supplier_url:
          "https://jp.mercari.com/shops/product/S2CCfSHPXxo7VzqwG8uNSi",
      },
      {
        id: 4, // 3190 + 350 = 3540、在庫あり
        supplier_url:
          "https://jp.mercari.com/shops/product/cAFQBpEtHurUTRMgVZLXb8",
      },
      {
        id: 5, // 8000、在庫あり
        supplier_url:
          "https://jp.mercari.com/shops/product/mJ2uzWPT6GKpoyToJQDK5M",
      },
    ];

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
        server: PROXY_SERVER,
        username: PROXY_USERNAME,
        password: PROXY_PASSWORD,
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
