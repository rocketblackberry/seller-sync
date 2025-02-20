"use client";

import useSeller from "@/hooks/useSeller";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { IoAdd } from "react-icons/io5";

export default function Seller() {
  const { sellers, selectedSellerId, updateSelectedSeller } = useSeller();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    ? [String(selectedSellerId)]
    : [];

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Seller"
        className="shrink-0"
        items={sellers}
        selectedKeys={selectedKey}
        placeholder="Select a seller"
        onChange={handleChange}
      >
        <>
          {sellers.map((seller) => (
            <SelectItem key={String(seller.id)} value={String(seller.id)}>
              {seller.name}
            </SelectItem>
          ))}
        </>
      </Select>
      <Button isIconOnly variant="flat" onPress={authenticateSeller}>
        <IoAdd />
      </Button>
    </div>
  );
}
