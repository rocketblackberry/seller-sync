import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const endpoint = `${process.env.EBAY_API_URL!}/sell/inventory/v1/inventory_item`;
  const accessToken = process.env.EBAY_API_ACCESS_TOKEN!;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Accept-Language": "en-US",
    "X-EBAY-API-CALL-NAME": "getInventoryItems",
  };

  const params = {
    limit: 10,
    offset: 0,
  };

  try {
    const response = await axios.get(endpoint, {
      headers,
      params,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
