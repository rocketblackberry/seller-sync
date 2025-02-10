const API_URL = process.env.NEXT_PUBLIC_EBAY_API_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI!;

export async function exchangeCodeForAccessToken(code: string) {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64",
  );

  const response = await fetch(`${API_URL}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange authorization code for access token");
  }

  return response.json();
}

export async function getSellerPrivileges(accessToken: string) {
  const response = await fetch(
    "https://apiz.sandbox.ebay.com/commerce/identity/v1/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get seller privileges");
  }

  return response.json();
}
