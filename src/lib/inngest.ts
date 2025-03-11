import axios from "axios";
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "seller-sync" });

// セラーインポートのハンドラー
export const importSeller = inngest.createFunction(
  { id: "Import eBay Seller" },
  { event: "ebay.import.seller" },
  async ({ event, step }) => {
    const { sellerId } = event.data;

    await step.run("Import first page", async () => {
      const response = await axios.get(
        `${process.env.NEXT_URL!}/api/ebay/import?seller=${sellerId}&page=1`,
      );
      return response.data;
    });
  },
);

// ページ単位のインポートハンドラー
export const importSellerPage = inngest.createFunction(
  { id: "Import eBay Seller Page" },
  { event: "ebay.import.seller.page" },
  async ({ event, step }) => {
    const { sellerId, page } = event.data;

    await step.sleep("Rate limit delay", "15s"); // 15秒のディレイ

    await step.run("Import page", async () => {
      const response = await axios.get(
        `${process.env.NEXT_URL!}/api/ebay/import?seller=${sellerId}&page=${page}`,
      );
      return response.data;
    });
  },
);
