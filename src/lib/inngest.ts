import axios from "axios";
import { Inngest } from "inngest";
import { ReviseItem } from "./ebay";

export const inngest = new Inngest({ id: "seller-sync" });

// eBayのインポートハンドラー
export const importSeller = inngest.createFunction(
  { id: "Import Seller" },
  { event: "import.seller" },
  async ({ event, step }) => {
    const { sellerId } = event.data;

    await step.run("Import seller", async () => {
      const response = await axios.get(
        `${process.env.NEXT_URL!}/api/ebay/import?seller=${sellerId}&page=1`,
      );
      return response.data;
    });
  },
);

// ページ単位のインポートハンドラー
export const importSellerPage = inngest.createFunction(
  { id: "Import Seller Page" },
  { event: "import.seller.page" },
  async ({ event, step }) => {
    const { sellerId, page } = event.data;

    await step.sleep("Rate limit delay", "15s"); // 15秒のディレイ

    await step.run("Import seller page", async () => {
      const response = await axios.get(
        `${process.env.NEXT_URL!}/api/ebay/import?seller=${sellerId}&page=${page}`,
      );
      return response.data;
    });
  },
);

// eBayのリバイスハンドラー
export const reviseSeller = inngest.createFunction(
  { id: "Revise Seller" },
  { event: "revise.seller" },
  async ({ event, step }) => {
    const { seller, items } = event.data;
    const formattedItems = (items as ReviseItem[]).map((item) => ({
      itemId: item.itemId,
      price: String(item.price),
      quantity: item.quantity,
    }));

    await step.sleep("Rate limit delay", "15s"); // 15秒のディレイ

    await step.run("Revise Seller", async () => {
      const response = await axios.post(
        `${process.env.NEXT_URL!}/api/ebay/revise`,
        { seller, items: formattedItems },
      );
      return response.data;
    });
  },
);

// 仕入先のスクレイピングハンドラー
export const scrapeSupplier = inngest.createFunction(
  { id: "Scrape Supplier" },
  { event: "scrape.supplier" },
  async ({ event, step }) => {
    const { sellerId, errorOnly } = event.data;

    await step.run("Scrape supplier", async () => {
      const response = await axios.get(
        `${process.env.NEXT_URL!}/api/supplier/scrape?seller=${sellerId}${errorOnly ? "&error=true" : ""}`,
      );
      return response.data;
    });
  },
);

// ページ単位のスクレイピングハンドラー
export const scrapeSupplierPage = inngest.createFunction(
  { id: "Scrape Supplier Page" },
  { event: "scrape.supplier.page" },
  async ({ event, step }) => {
    const { sellerId, page, errorOnly } = event.data;

    // await step.sleep("Rate limit delay", "30s"); // 30秒のディレイ

    await step.run("Scrape supplier page", async () => {
      const response = await axios.get(
        `${process.env.NEXT_URL!}/api/supplier/scrape?seller=${sellerId}&page=${page}${errorOnly ? "&error=true" : ""}`,
      );
      return response.data;
    });
  },
);
