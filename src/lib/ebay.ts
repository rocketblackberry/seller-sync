import dayjs from "@/lib/dayjs";
import { EbayApiError, EbayItem } from "@/types";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const API_URL = process.env.NEXT_PUBLIC_EBAY_API_URL!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI!;
const APP_ID = process.env.NEXT_PUBLIC_EBAY_APP_ID!;
const CERT_ID = process.env.EBAY_CERT_ID!;

/**
 * Applicationアクセストークンを取得する
 * 用途：サーバー間通信
 * 有効期限：2時間
 */
export async function getApplicationAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${APP_ID}:${CERT_ID}`).toString("base64");

  try {
    const response = await axios.post(
      `${API_URL}/identity/v1/oauth2/token`,
      `grant_type=client_credentials&scope=${encodeURIComponent("https://api.ebay.com/oauth/api_scope")}`,
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
  const credentials = Buffer.from(`${APP_ID}:${CERT_ID}`).toString("base64");

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
  const credentials = Buffer.from(`${APP_ID}:${CERT_ID}`).toString("base64");

  try {
    const response = await axios.post(
      `${API_URL}/identity/v1/oauth2/token`,
      `grant_type=refresh_token&refresh_token=${refreshToken}&scope=${encodeURIComponent("https://api.ebay.com/oauth/api_scope")}`,
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
  pageNumber: number = 1,
  perPage: number = 100,
): Promise<{
  items: EbayItem[];
  hasMore: boolean;
  totalItems: number;
  perPage: number;
  pageNumber: number;
  totalPages: number;
}> {
  try {
    const endTimeFrom = dayjs().utc().subtract(5, "day").format();
    const endTimeTo = dayjs().utc().add(35, "day").format();
    console.log({ endTimeFrom, endTimeTo });

    // XMLリクエストボディ
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
      <GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
          <eBayAuthToken>${accessToken}</eBayAuthToken>
        </RequesterCredentials>
        <UserID>${sellerId}</UserID>
        <EndTimeFrom>${endTimeFrom}</EndTimeFrom>
        <EndTimeTo>${endTimeTo}</EndTimeTo>
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

    const { Errors } = json.GetSellerListResponse;

    if (Errors) {
      throw new EbayApiError(Errors.ErrorCode, Errors.ShortMessage);
    }

    // 必要な情報だけを返す
    const {
      HasMoreItems,
      ItemArray: { Item },
      ItemsPerPage,
      PageNumber,
      PaginationResult: { TotalNumberOfEntries, TotalNumberOfPages },
    } = json.GetSellerListResponse;

    return {
      items: Item ?? [],
      hasMore: HasMoreItems,
      totalItems: TotalNumberOfEntries,
      perPage: ItemsPerPage,
      pageNumber: PageNumber,
      totalPages: TotalNumberOfPages,
    };
  } catch (error) {
    if (error instanceof EbayApiError) {
      throw error;
    }
    throw new Error(`Failed to get seller id: ${(error as Error).message}`);
  }
}

/**
 * 商品情報を更新する
 */
export type ReviseItem = {
  itemId: string;
  price: number;
  quantity: number;
};

export async function reviseItems(
  accessToken: string,
  items: ReviseItem[],
): Promise<void> {
  try {
    // XMLリクエストボディ
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
      <ReviseInventoryStatusRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
          <eBayAuthToken>${accessToken}</eBayAuthToken>
        </RequesterCredentials>
        ${items
          .map(
            ({ itemId, price, quantity }) => `
              <InventoryStatus>
                <ItemID>${itemId}</ItemID>
                <StartPrice>${price}</StartPrice>
                <Quantity>${quantity}</Quantity>
              </InventoryStatus>
            `,
          )
          .join("")}
      </ReviseInventoryStatusRequest>`;

    // リクエストを送信する
    const response = await axios.post(`${API_URL}/ws/api.dll`, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        "X-EBAY-API-SITEID": "0",
        "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
        "X-EBAY-API-CALL-NAME": "ReviseInventoryStatus",
        "X-EBAY-API-IAF-TOKEN": accessToken,
      },
    });

    // XMLレスポンスをJSONに変換する
    const json = await parseStringPromise(response.data, {
      explicitArray: false,
    });

    const { Errors } = json.ReviseInventoryStatusResponse;

    if (Errors) {
      throw new EbayApiError(Errors.ErrorCode, Errors.ShortMessage);
    }
  } catch (error) {
    if (error instanceof EbayApiError) {
      throw error;
    }
    throw new Error(`Failed to revise items: ${(error as Error).message}`);
  }
}
