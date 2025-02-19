"use client";

import useSeller from "@/hooks/useSeller";
import { Select, SelectItem } from "@nextui-org/react";

export default function Seller() {
  const { sellers, selectedSellerId, updateSelectedSeller } = useSeller();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "0") {
      authenticateSeller();
      return;
    }
    updateSelectedSeller(parseInt(e.target.value));
  };

  /**
   * 認可コードを取得する
   */
  const authenticateSeller = (): void => {
    const AUTH_URL = process.env.NEXT_PUBLIC_EBAY_AUTH_URL!;
    const CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI!;
    const SCOPE = encodeURIComponent("https://api.ebay.com/oauth/api_scope");
    const loginUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;

    location.href = loginUrl;
  };

  const selectedKey = sellers.some(
    (seller) => String(seller.id) === String(selectedSellerId),
  )
    ? String(selectedSellerId)
    : "0";

  return (
    <>
      <Select
        aria-label="Seller"
        className="shrink-0"
        items={sellers}
        selectedKeys={[selectedKey]}
        placeholder="Select a seller"
        onChange={handleChange}
      >
        <>
          {sellers.map((seller) => (
            <SelectItem key={String(seller.id)} value={String(seller.id)}>
              {seller.name}
            </SelectItem>
          ))}
          <SelectItem key="0" value="0">
            セラーを追加する
          </SelectItem>
        </>
      </Select>
    </>
  );
}
