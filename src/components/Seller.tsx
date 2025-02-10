"use client";

import useAuth from "@/hooks/useAuth";
import { Seller } from "@/interfaces";
import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function Seller() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Pick<Seller, "id" | "name">[]>([]);

  useEffect(() => {
    if (!user) return;
    getSellers();
  }, [user]);

  const getSellers = async () => {
    const response = await fetch("/api/sellers");
    const data = await response.json();
    data.push({ id: "0", name: "セラーを追加する" });
    setSellers(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "0") {
      const AUTH_URL = process.env.NEXT_PUBLIC_EBAY_AUTH_URL!;
      const CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!;
      const REDIRECT_URI = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI!;
      const SCOPE = encodeURIComponent(
        "https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account",
      );
      const loginUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;

      location.href = loginUrl;
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
