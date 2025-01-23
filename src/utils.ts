import {
  FUEL_SURCHARGE_RATE,
  FVF_RATE,
  PROMOTE_RATE,
  SHIPPING_PRICE_LIST,
} from "./constants";

// 売値を計算する（売値 = 仕入値 + 送料 + 利益額 + FVF + 広告費）
export const calcPrice = (
  cost: number, // 仕入値（円）
  freight: number, // 送料（円）
  profitRate: number, // 利益率（例: 10% は 10 として渡す）
  fvfRate: number, // FVF率（例: 13% は 13 として渡す）
  promoteRate: number, // 広告費率（例: 2% は 2 として渡す）
  exchangeRate: number // ドル円の為替レート（例: 155.97）
): number => {
  const costInDollar = cost / exchangeRate; // 仕入値をドルに変換
  const freightInDollar = freight / exchangeRate; // 送料をドルに変換
  const totalCostInDollar = costInDollar + freightInDollar;
  const sellingPriceInDollar =
    totalCostInDollar /
    (1 - (fvfRate / 100 + promoteRate / 100 + profitRate / 100));
  return Math.round(sellingPriceInDollar * 100) / 100; // 小数点以下2桁に丸める
};

// 利益額を計算する（利益額 = 売値 - (仕入値 + 送料 + FVF + 広告費)）
export const calcProfit = (
  price: number, // 売値（ドル）
  cost: number, // 仕入値（円）
  freight: number, // 送料（円）
  fvfRate: number, // FVF率（例: 13% は 13 として渡す）
  promoteRate: number, // 広告費率（例: 2% は 2 として渡す）
  exchangeRate: number // ドル円の為替レート（例: 155.97）
): number => {
  const costInDollar = cost / exchangeRate; // 仕入値をドルに変換
  const freightInDollar = freight / exchangeRate; // 送料をドルに変換
  const fvf = (price * fvfRate) / 100; // FVF
  const promote = (price * promoteRate) / 100; // 広告費
  const totalCostInDollar = costInDollar + freightInDollar + fvf + promote;
  const profitInDollar = price - totalCostInDollar;
  const profitInYen = profitInDollar * exchangeRate; // 利益を円に変換
  return Math.round(profitInYen); // 整数に丸める
};

// 利益率を計算する（利益率 = (利益額 / 売値) * 100）
export const calcProfitRate = (
  price: number, // 売値（ドル）
  cost: number, // 仕入値（円）
  freight: number, // 送料（円）
  fvfRate: number, // FVF率（例: 13% は 13 として渡す）
  promoteRate: number, // 広告費率（例: 2% は 2 として渡す）
  exchangeRate: number // ドル円の為替レート（例: 155.97）
): number => {
  const profit = calcProfit(
    price,
    cost,
    freight,
    fvfRate,
    promoteRate,
    exchangeRate
  );
  const profitRate = (profit / price) * 100;
  return Math.round(profitRate * 10) / 10; // 小数点以下1位に丸める
};

// 送料を計算する
export const calcFreight = (
  weight: number // 重量（kg）
): number => {
  const adjustedWeight = weight <= 0.5 ? 0.5 : weight;
  const shippingPriceEntry = SHIPPING_PRICE_LIST.find(
    (entry) => entry.weight >= adjustedWeight
  );
  if (!shippingPriceEntry) return 0;
  const shippingPrice = shippingPriceEntry.price;
  const fuelSurcharge = Math.round((shippingPrice * FUEL_SURCHARGE_RATE) / 100);
  return shippingPrice + fuelSurcharge;
};
