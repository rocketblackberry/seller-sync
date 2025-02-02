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

export async function GET() {
  try {
    /* const { rows }: { rows: Item[] } =
      await sql`SELECT id, supplier_url FROM items`; */

    const rows = [
      /* {
        id: 1, // 17400、在庫あり
        supplier_url: "https://jp.mercari.com/item/m95296759683",
      },
      {
        id: 2, // 17400、在庫なし
        supplier_url: "https://jp.mercari.com/item/m52426752496",
      },
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
      }, */
      /* {
        id: 6, // 5980、在庫あり
        supplier_url: "https://paypayfleamarket.yahoo.co.jp/item/z384371160",
      },
      {
        id: 7, // 10800、在庫あり
        supplier_url: "https://paypayfleamarket.yahoo.co.jp/item/z394991140",
      },
      {
        id: 8, // 12000、在庫なし
        supplier_url: "https://paypayfleamarket.yahoo.co.jp/item/z399431048",
      }, */
      /* {
        id: 9, // 30000、オークション、在庫あり
        supplier_url:
          "https://page.auctions.yahoo.co.jp/jp/auction/e1163637979",
      },
      {
        id: 10, // 20000、即決、在庫あり
        supplier_url:
          "https://page.auctions.yahoo.co.jp/jp/auction/s1164064807",
      },
      {
        id: 11, // 7200|7201 + 1000、併用、在庫あり
        supplier_url:
          "https://page.auctions.yahoo.co.jp/jp/auction/q1170267528",
      },
      {
        id: 12, // 終了
        supplier_url:
          "https://page.auctions.yahoo.co.jp/jp/auction/b1147469408",
      }, */
      /* {
        id: 13, // 11000、在庫あり
        supplier_url:
          "https://store.shopping.yahoo.co.jp/digitamin/zf126107.html?sc_i=shopping-pc-web-result-item-rsltlst-img&ea=13",
      },
      {
        id: 14, // 12100、在庫なし（予約）
        supplier_url:
          "https://store.shopping.yahoo.co.jp/amiami/figure-179676.html?sc_i=shopping-pc-web-result-item-rsltlst-img&ea=13",
      },
      {
        id: 15, // 126900 + 4880 = 131780、在庫あり
        supplier_url:
          "https://store.shopping.yahoo.co.jp/stm/ssg-dl-335009.html",
      }, */
      {
        id: 16, // 1891、在庫なし
        supplier_url:
          "https://www.amazon.co.jp/QuietComfort-Alternate-%E4%BA%A4%E6%8F%9B%E7%94%A8%E3%82%B7%E3%83%AA%E3%82%B3%E3%83%B3%E8%A3%BD%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%81%E3%83%83%E3%83%97-%E3%82%B9%E3%82%BF%E3%83%93%E3%83%AA%E3%83%86%E3%82%A3%E3%83%90%E3%83%B3%E3%83%89-%E3%83%88%E3%83%AA%E3%83%97%E3%83%AB%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF/dp/B0BSF6CCQ7/ref=sr_1_13?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=CN6UYRZUG882&dib=eyJ2IjoiMSJ9._dE0Lx0jpWoEh8RPQIX85Ug-p_eZG50XISeoEHu0Pfo6rLegl8FHIUi1eaJACIZTOX6N8tiFVXce2DQ34sUNg7bW0nZLtt1yWLSujr_JQXSXy0uLIWHDL67pKgjOgFPLmCHSYNswKPuZPc2m5cY1kY60qJTYhKNrCM2tPArNjBnvoXYgOqszwnSkCPQLnv-CraWoT28zW790_qU0voAPU7tgr2OuYlYO3MjdkDZj3b33ziBfFHMgxAqR6QSCzMRaNFperFiudjiy-kPaY_UWEv0uIDXixCoqpnunSX6zy0C8kJazgNbMiVRHAif5Qg9q4dLktekqwBM00BIQb9pYeNg-y_cht7mvIjHu9qq0pfgfbQDVV_gGkHomqlDIgwyhTglbajah8xsZ29UueGU9jtXub9Ju0AtFHXBi3O4Nk9sZ-IKL-O9hYOEgaULk81Te.fb9LCj4YD7pgvnkFAinkeri1HFRjtxDQIMqI39cupjw&dib_tag=se&keywords=earbuds+2+%E7%B4%94%E6%AD%A3+%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%94%E3%83%BC%E3%82%B9&qid=1738257483&sprefix=earbuds+2+%E7%B4%94%E6%AD%A3%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%94%E3%83%BC%E3%82%B9,aps,164&sr=8-13&th=1",
      },
      {
        id: 17, // 価格なし、在庫なし
        supplier_url:
          "https://www.amazon.co.jp/QuietComfort-Alternate-%E4%BA%A4%E6%8F%9B%E7%94%A8%E3%82%B7%E3%83%AA%E3%82%B3%E3%83%B3%E8%A3%BD%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%81%E3%83%83%E3%83%97-%E3%82%B9%E3%82%BF%E3%83%93%E3%83%AA%E3%83%86%E3%82%A3%E3%83%90%E3%83%B3%E3%83%89-%E3%83%88%E3%83%AA%E3%83%97%E3%83%AB%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF/dp/B0BSF79TSR/ref=sr_1_13?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=CN6UYRZUG882&dib=eyJ2IjoiMSJ9._dE0Lx0jpWoEh8RPQIX85Ug-p_eZG50XISeoEHu0Pfo6rLegl8FHIUi1eaJACIZTOX6N8tiFVXce2DQ34sUNg7bW0nZLtt1yWLSujr_JQXSXy0uLIWHDL67pKgjOgFPLmCHSYNswKPuZPc2m5cY1kY60qJTYhKNrCM2tPArNjBnvoXYgOqszwnSkCPQLnv-CraWoT28zW790_qU0voAPU7tgr2OuYlYO3MjdkDZj3b33ziBfFHMgxAqR6QSCzMRaNFperFiudjiy-kPaY_UWEv0uIDXixCoqpnunSX6zy0C8kJazgNbMiVRHAif5Qg9q4dLktekqwBM00BIQb9pYeNg-y_cht7mvIjHu9qq0pfgfbQDVV_gGkHomqlDIgwyhTglbajah8xsZ29UueGU9jtXub9Ju0AtFHXBi3O4Nk9sZ-IKL-O9hYOEgaULk81Te.fb9LCj4YD7pgvnkFAinkeri1HFRjtxDQIMqI39cupjw&dib_tag=se&keywords=earbuds+2+%E7%B4%94%E6%AD%A3+%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%94%E3%83%BC%E3%82%B9&qid=1738257483&sprefix=earbuds+2+%E7%B4%94%E6%AD%A3%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%94%E3%83%BC%E3%82%B9,aps,164&sr=8-13&th=1",
      },
      {
        id: 18, // 2880、在庫あり
        supplier_url:
          "https://www.amazon.co.jp/%E3%82%AA%E3%83%BC%E3%83%84%E3%83%9F%E3%83%AB%E3%82%AF-3%E7%A8%AE%E3%82%A2%E3%82%BD%E3%83%BC%E3%83%88-%E9%A3%B2%E3%81%BF%E6%AF%94%E3%81%B9-%E3%82%AA%E3%83%BC%E3%83%84%E3%83%9F%E3%83%AB%E3%82%AF%E3%83%81%E3%83%A7%E3%82%B3%E3%83%AC%E3%83%BC%E3%83%88-%E3%82%AA%E3%83%BC%E3%83%84%E3%82%B5%E3%82%A4%E3%83%89/dp/B0DN5NLN6Q/ref=sr_1_48?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=1X4ZQYHDWSXRM&dib=eyJ2IjoiMSJ9.iUYdATnLJhjjm-Rw6pM0j41oGRk5lDMFhYTyH-xJLEtE5MkUnjJbBPEPBrkhZjACNeRdC8eov7bUty8OLCUORCOuoauaSn7dAMGgtOVDxVn4TdU2EUFOcefqoMO8af8TLfP6nSFnNRC0qNWfUoUHy67hyLqY8kDedvhfXxbBl223Tv_2yaYyyde_j95aBnByca8EIz0Oa2-5-dA0DYpAtwnscUGih_K85sI1GGrwhrViKEBIFUj-2-aUhjt_E_AG9lVxw1FL5dAsPCfvH-vwWrkKRfjObCJAnyn46q59WSSP5_xLtMzVXfhwDANs6hcFRdtuhzY2pNJix0zGpnwqK4fmUDfoz107AnzoLxDUreWEgek2lEALP5GclciZhbe9Jd8_gOx71t6umD_F5TpVOBpTD7lLLJbpKOhdY8K4eALF2JZcaYHZ--1TG-JxKDFb.MBZaplmYf8cALBGi11Ig-Y2Bky0FNd1SfLYv1jOdDDQ&dib_tag=se&keywords=%E3%82%AA%E3%83%BC%E3%83%84%E3%83%9F%E3%83%AB%E3%82%AF&qid=1738258164&rnid=2227305051&sprefix=%E3%82%AA%E3%83%BC%E3%83%84%E3%83%9F%E3%83%AB%E3%82%AF,aps,182&sr=8-48",
      },
      {
        id: 19, // 価格なし、在庫なし
        supplier_url:
          "https://www.amazon.co.jp/%E3%83%8E%E3%83%BC%E3%83%96%E3%83%A9%E3%83%B3%E3%83%89%E5%93%81-%E4%BB%A4%E5%92%8C%E5%85%83%E5%B9%B4%E7%94%A3%E6%9C%80%E7%B5%82%E3%82%BB%E3%83%BC%E3%83%AB%EF%BC%81%EF%BC%81%E3%80%90%E7%84%A1%E6%B4%97%E7%B1%B35kg%E3%80%91%E7%A7%8B%E7%94%B0%E7%9C%8C%E7%94%A3-%E3%81%82%E3%81%8D%E3%81%9F%E3%81%93%E3%81%BE%E3%81%A1-%E5%8E%B3%E9%81%B8%E7%B1%B3-%E7%B1%B3%E3%81%B3%E3%81%A4%E5%BD%93%E7%95%AA%E3%80%90%E5%A4%A9%E9%B7%B9%E5%94%90%E8%BE%9B%E5%AD%90%E3%80%91%E3%83%97%E3%83%AC%E3%82%BC%E3%83%B3%E3%83%88%E4%BB%98%E3%81%8D/dp/B0CW61ZFHC/ref=sxin_15_pa_sp_search_thematic_sspa?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&content-id=amzn1.sym.57a3ea1b-1987-43af-8c63-550d56137165:amzn1.sym.57a3ea1b-1987-43af-8c63-550d56137165&crid=3FK5SI69ZMJTW&cv_ct_cx=%E7%84%A1%E6%B4%97%E7%B1%B3&keywords=%E7%84%A1%E6%B4%97%E7%B1%B3&pd_rd_i=B0859F5P82&pd_rd_r=7f440c92-616a-4315-b2f5-86a175a97fed&pd_rd_w=OeNIA&pd_rd_wg=5LdM1&pf_rd_p=57a3ea1b-1987-43af-8c63-550d56137165&pf_rd_r=A57B155NTQ67QZCPQ8T9&qid=1738258269&sbo=RZvfv//HxDF+O5021pAnSA%3D%3D&sprefix=%E7%84%A1%E6%B4%97%E7%B1%B3,aps,185&sr=1-4-9ad0563b-de06-426f-a1d3-3a92323660bd-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1",
      },
      {
        id: 20, // 4104、在庫なし（〜以内に発送）
        supplier_url:
          "https://www.amazon.co.jp/Amazon%E3%83%96%E3%83%A9%E3%83%B3%E3%83%89-Happy-Belly-%E3%81%82%E3%81%8D%E3%81%9F%E3%81%93%E3%81%BE%E3%81%A1-%E4%BB%A4%E5%92%8C5%E5%B9%B4%E7%94%A3/dp/B00ENWQYNS/ref=sr_1_1_ffob_sspa?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=3FK5SI69ZMJTW&dib=eyJ2IjoiMSJ9.T9nTshmBr_TTzk1EWWiK-ibjQAR66czVp3yplLYe3FxBdShzNGWYJHrhAWfsKkMjf0D5b8fKMqypqqyNAOI3BArWAcm0mqV1sUpvkQfdVhosUgDMnjEqXOX9AKL_6nwEUNkGYZ8eBPXwnogh18_W9UWg0t1Bw8WWn7DCsXDjho46Ugq8HGxATxDvCepzQCWPh-HyUD7avrEZEnSYAT_Woujth993bhKa1kkDkfobpQ7tzOUmRlzLEEPlXmsWiV7a3UUgmm8KFYJwAlbsgAN7YDXb1QjHf863Es-OZD5yonQ.9_Y7dHKxmff7iOPf_ETTcMerjLS9WykP4IevKBltmWk&dib_tag=se&keywords=%E7%84%A1%E6%B4%97%E7%B1%B3&qid=1738258269&sprefix=%E7%84%A1%E6%B4%97%E7%B1%B3,aps,185&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1",
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
