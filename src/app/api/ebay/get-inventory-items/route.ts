import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  const appid = "KeiShimo-ListingM-SBX-3fa89c492-838102d1"; // 取得したAppID
  const devid = "5214b9c2-bc33-4b03-9607-a9c7b8dd8165"; // 取得したDevID
  const certid = "SBX-fa89c49201ec-a65c-4155-b252-5645"; // 取得したCertID
  const token =
    "v^1.1#i^1#r^1#I^3#p^3#f^0#t^Ul4xMF83OkY3NzE0MEU1MjM2NDJERTVENDA3RDBGRDgzODk2QTgyXzFfMSNFXjEyODQ="; // 取得したユーザートークン

  const xmlRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <GetInventoryItemsRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <RequesterCredentials>
                <eBayAuthToken>${token}</eBayAuthToken>
            </RequesterCredentials>
        </GetInventoryItemsRequest>
    `;

  try {
    const response = await axios.post(
      "https://api.sandbox.ebay.com/ws/api.dll",
      xmlRequest,
      {
        headers: {
          "X-EBAY-API-SITEID": "0",
          "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
          "X-EBAY-API-CALL-NAME": "GetInventoryItems",
          "X-EBAY-API-DEV-NAME": devid,
          "X-EBAY-API-APP-NAME": appid,
          "X-EBAY-API-CERT-NAME": certid,
          "Content-Type": "text/xml",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
