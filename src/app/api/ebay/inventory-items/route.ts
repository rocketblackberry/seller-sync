import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const EBAY_API_URL =
    "https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item";

  const headers = {
    Authorization: `Bearer ${process.env.EBAY_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    // "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    // "X-EBAY-API-APP-ID": process.env.EBAY_APP_ID,
    // "X-EBAY-API-CERT-ID": process.env.EBAY_CERT_ID,
    // "X-EBAY-API-DEV-ID": process.env.EBAY_DEV_ID,
  };

  console.log("Request URL:", EBAY_API_URL);
  console.log("Request Headers:", headers);

  try {
    const response = await axios.get(EBAY_API_URL, { headers });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching eBay Sandbox listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch eBay Sandbox listings" },
      { status: 500 }
    );
  }
}
