import {
  importSeller,
  importSellerPage,
  inngest,
  reviseSeller,
  scrapeSupplier,
  scrapeSupplierPage,
} from "@/lib/inngest";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    importSeller,
    importSellerPage,
    reviseSeller,
    scrapeSupplier,
    scrapeSupplierPage,
  ],
});
