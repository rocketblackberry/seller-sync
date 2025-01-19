import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const appid = "KeiShimo-ListingM-SBX-3fa89c492-838102d1";
  const devid = "5214b9c2-bc33-4b03-9607-a9c7b8dd8165";
  const certid = "SBX-fa89c49201ec-a65c-4155-b252-5645";
  const token =
    "v^1.1#i^1#r^1#I^3#p^3#f^0#t^Ul4xMF83OkY3NzE0MEU1MjM2NDJERTVENDA3RDBGRDgzODk2QTgyXzFfMSNFXjEyODQ=";

  try {
    const response = await axios.get(
      "https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // "X-EBAY-API-DEV-NAME": devid,
          // "X-EBAY-API-APP-NAME": appid,
          // "X-EBAY-API-CERT-NAME": certid,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
