import { SUPPLIER_DOMAINS, SUPPLIER_ICONS } from "@/constants";
import { ReactNode } from "react";

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

/**
 * 仕入先のアイコンを取得する
 */
export const getSupplierIcon = (supplier: string): ReactNode => {
  if (supplier in SUPPLIER_ICONS) {
    const icon = SUPPLIER_ICONS[supplier as keyof typeof SUPPLIER_ICONS];
    return (
      <span
        className={`inline-block rounded px-1.5 py-1 text-xs text-white ${icon.color}`}
      >
        {icon.key}
      </span>
    );
  }
  return <span>-</span>;
};
