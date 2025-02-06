"use client";

import { Select, SelectItem } from "@nextui-org/react";

const sellers = [
  { id: 1, name: "Seller 1" },
  { id: 2, name: "Seller 2" },
  { id: 3, name: "Seller 3" },
  { id: 0, name: "セラーを追加" },
];

export default function Seller() {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "0") {
      const EBAY_CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID || "";
      const EBAY_REDIRECT_URL = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URL || "";
      const ebayLoginUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${EBAY_CLIENT_ID}&redirect_uri=${encodeURIComponent(EBAY_REDIRECT_URL)}&response_type=code&scope=https://api.ebay.com/oauth/api_scope/sell.inventory`;
      window.open(ebayLoginUrl, "_blank");
    }
  };

  return (
    <>
      <Select
        aria-label="Seller"
        className="shrink-0"
        items={sellers}
        placeholder="Select a seller"
        onChange={handleChange}
      >
        {(seller) => (
          <SelectItem key={seller.id} value={seller.id}>
            {seller.name}
          </SelectItem>
        )}
      </Select>
    </>
  );
}
