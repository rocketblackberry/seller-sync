import { SUPPLIER_DOMAINS } from "@/constants";

/**
 * 仕入先を判定する
 */
export const detectSupplier = (url: string): string | undefined => {
  for (const [key, urls] of Object.entries(SUPPLIER_DOMAINS)) {
    if (urls.some((url_) => url.startsWith(url_))) {
      return key;
    }
  }
  return undefined;
};
