import { EbayApiError, Item } from "@/interfaces";
import dayjs from "@/lib/dayjs";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const API_URL = process.env.NEXT_PUBLIC_EBAY_API_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI!;

/**
 * Applicationアクセストークンを取得する
 * 用途：サーバー間通信
 * 有効期限：2時間
 */
export async function getApplicationAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64",
  );

  try {
    const response = await axios.post(
      `${API_URL}/identity/v1/oauth2/token`,
      "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error(`Internal Server Error: ${error}`);
  }
}

/**
 * Userアクセストークンを取得する
 * 用途：ユーザー認証
 * 有効期限：18ヶ月（Refreshトークン）
 */
export async function getUserAccessToken(
  code: string,
): Promise<{ access_token: string; refresh_token: string }> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64",
  );

  try {
    const response = await axios.post(
      `${API_URL}/identity/v1/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to exchange authorization code for access token: ${(error as Error).message}`,
    );
  }
}

/**
 * Userアクセストークンを更新する
 */
export async function refreshUserAccessToken(
  refreshToken: string,
): Promise<string> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64",
  );

  try {
    const response = await axios.post(
      `${API_URL}/identity/v1/oauth2/token`,
      `grant_type=refresh_token&refresh_token=${refreshToken}&scope=https://api.ebay.com/oauth/api_scope`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${error}`);
  }
}

/**
 * セラー情報を取得する
 */
export async function getUser(accessToken: string) {
  try {
    // XML リクエストボディ
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <GetUserRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${accessToken}</eBayAuthToken>
      </RequesterCredentials>
    </GetUserRequest>`;

    // axios でリクエスト送信
    const response = await axios.post(`${API_URL}/ws/api.dll`, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        "X-EBAY-API-SITEID": "0", // USサイト
        "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
        "X-EBAY-API-CALL-NAME": "GetUser",
        "X-EBAY-API-IAF-TOKEN": accessToken, // アクセストークンをヘッダーにも追加
      },
    });

    // セラーIDを取得
    const sellerIdMatch = response.data.match(/<UserID>(.*?)<\/UserID>/);
    const sellerId = sellerIdMatch ? sellerIdMatch[1] : null;

    if (!sellerId) {
      throw new Error("Failed to parse eBay response");
    }

    // ストア名を取得
    const storeNameMatch = response.data.match(/<StoreName>(.*?)<\/StoreName>/);
    const storeName = storeNameMatch ? storeNameMatch[1] : null;

    return { sellerId, storeName };
  } catch (error) {
    throw new Error(`Failed to get seller id: ${(error as Error).message}`);
  }
}

/**
 * 商品一覧を取得する
 */
export async function getSellerList(
  sellerId: string,
  accessToken: string,
  perPage: number = 100,
  pageNumber: number = 1,
) {
  try {
    const startTimeTo = dayjs().utc().format();
    const startTimeFrom = dayjs().utc().subtract(90, "day").format();

    // XMLリクエストボディ
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
      <GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
          <eBayAuthToken>${accessToken}</eBayAuthToken>
        </RequesterCredentials>
        <UserID>${sellerId}</UserID>
        <StartTimeFrom>${startTimeFrom}</StartTimeFrom>
        <StartTimeTo>${startTimeTo}</StartTimeTo>
        <DetailLevel>ReturnAll</DetailLevel>
        <Pagination>
          <EntriesPerPage>${perPage}</EntriesPerPage>
          <PageNumber>${pageNumber}</PageNumber>
        </Pagination>
      </GetSellerListRequest>`;

    // リクエストを送信する
    const response = await axios.post(`${API_URL}/ws/api.dll`, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        "X-EBAY-API-SITEID": "0", // USサイト
        "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
        "X-EBAY-API-CALL-NAME": "GetSellerList",
        "X-EBAY-API-IAF-TOKEN": accessToken, // アクセストークンをヘッダーにも追加
      },
    });

    if (!response.data) {
      throw new Error("Failed to get seller list");
    }

    // XMLレスポンスをJSONに変換する
    const json = await parseStringPromise(response.data, {
      explicitArray: false,
    });
    console.log(json);

    const { Errors } = json.GetSellerListResponse;

    if (Errors) {
      throw new EbayApiError(Errors.ErrorCode, Errors.ShortMessage);
    }

    // 必要な情報だけを返す
    return json.GetSellerListResponse.ItemArray?.Item ?? [];
  } catch (error) {
    if (error instanceof EbayApiError) {
      throw error;
    }
    throw new Error(`Failed to get seller id: ${(error as Error).message}`);
  }
}

/**
 * 商品を追加する
 */
export async function addItem(item: Item | null, accessToken: string) {
  try {
    // XMLリクエストボディ
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
      <AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
          <eBayAuthToken>${accessToken}</eBayAuthToken>
        </RequesterCredentials>
        <Item>
          <Title>Test Product</Title>
          <Description>This is a test item for eBay Sandbox.</Description>
          <PrimaryCategory>
            <CategoryID>11116</CategoryID>
          </PrimaryCategory>
          <StartPrice>10.00</StartPrice>
          <ConditionID>1000</ConditionID>
          <CategoryMappingAllowed>true</CategoryMappingAllowed>
          <Country>US</Country>
          <Currency>USD</Currency>
          <DispatchTimeMax>3</DispatchTimeMax>
          <ListingDuration>GTC</ListingDuration>
          <ListingType>FixedPriceItem</ListingType>
          <PaymentMethods>PayPal</PaymentMethods>
          <PayPalEmailAddress>testuser@ebay.com</PayPalEmailAddress>
          <PictureDetails>
            <PictureURL>https://example.com/test.jpg</PictureURL>
          </PictureDetails>
          <PostalCode>95125</PostalCode>
          <Quantity>1</Quantity>
          <ReturnPolicy>
            <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
            <RefundOption>MoneyBack</RefundOption>
            <ReturnsWithinOption>Days_30</ReturnsWithinOption>
            <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
          </ReturnPolicy>
          <ShippingDetails>
            <ShippingType>Flat</ShippingType>
            <ShippingServiceOptions>
              <ShippingServicePriority>1</ShippingServicePriority>
              <ShippingService>USPSPriority</ShippingService>
              <ShippingServiceCost>5.00</ShippingServiceCost>
            </ShippingServiceOptions>
          </ShippingDetails>
          <Site>US</Site>
        </Item>
      </AddItemRequest>`;

    // リクエストを送信する
    const response = await axios.post(`${API_URL}/ws/api.dll`, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        "X-EBAY-API-SITEID": "0", // USサイト
        "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
        "X-EBAY-API-DEV-NAME": process.env.EBAY_DEV_NAME,
        "X-EBAY-API-APP-ID": process.env.NEXT_PUBLIC_EBAY_CLIENT_ID,
        "X-EBAY-API-CERT-NAME": process.env.EBAY_CERT_NAME,
        "X-EBAY-API-CALL-NAME": "AddItem",
        "X-EBAY-API-IAF-TOKEN": accessToken, // アクセストークンをヘッダーにも追加
      },
    });

    if (!response.data) {
      throw new Error("Failed to get seller list");
    }

    // XMLレスポンスをJSONに変換する
    const json = await parseStringPromise(response.data, {
      explicitArray: false,
    });
    console.log(json);

    const { Errors } = json.AddItemResponse;
    console.log(Errors);

    if (Errors) {
      throw new EbayApiError(Errors.ErrorCode, Errors.ShortMessage);
    }

    // 必要な情報だけを返す
    return {};
    // return json.GetSellerListResponse.ItemArray?.;
  } catch (error) {
    if (error instanceof EbayApiError) {
      throw error;
    }
    throw new Error(`Failed to get seller id: ${(error as Error).message}`);
  }
}
