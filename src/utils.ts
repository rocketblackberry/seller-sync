import {
  FVF_RATE,
  PROMOTE_RATE,
  FUEL_SURCHARGE_RATE,
  SHIPPING_PRICE_LIST,
} from "./constants";
import { IItem } from "@/interfaces";

// 売値 = 仕入値 + 送料 + 利益額 + FVF + 広告費
export const calcPrice = (
  cost: number, // 仕入値（円）
  freight: number, // 送料（円）
  margin: number, // 利益率（例: 20% は 20 として渡す）
  exchangeRate: number // ドル円の為替レート（例: 155.97）
): number => {
  const marginRate = margin / 100;
  const costInDollar = cost / exchangeRate; // 仕入値をドルに変換
  const freightInDollar = freight / exchangeRate; // 送料をドルに変換
  const totalCostInDollar = costInDollar + freightInDollar;
  const sellingPriceInDollar =
    totalCostInDollar / (1 - (FVF_RATE + PROMOTE_RATE + marginRate));
  return Math.round(sellingPriceInDollar * 100) / 100; // 小数点以下2桁に丸める
};

// 利益額 = 売値 - (仕入値 + 送料 + FVF + 広告費)
export const calcProfit = (
  price: number, // 売値（ドル）
  cost: number, // 仕入値（円）
  freight: number, // 送料（円）
  exchangeRate: number // ドル円の為替レート（例: 155.97）
): number => {
  const costInDollar = cost / exchangeRate; // 仕入値をドルに変換
  const freightInDollar = freight / exchangeRate; // 送料をドルに変換
  const fvf = price * FVF_RATE; // FVF
  const promote = price * PROMOTE_RATE; // 広告費
  const totalCostInDollar = costInDollar + freightInDollar + fvf + promote;
  const profitInDollar = price - totalCostInDollar;
  const profitInYen = profitInDollar * exchangeRate; // 利益を円に変換
  return Math.round(profitInYen); // 整数に丸める
};

// 利益率 = (利益額 / 売値) * 100
export const calcMargin = (
  price: number, // 売値（ドル）
  cost: number, // 仕入値（円）
  freight: number, // 送料（円）
  exchangeRate: number // ドル円の為替レート（例: 155.97）
): number => {
  const profit = calcProfit(price, cost, freight, exchangeRate);
  const margin = (profit / price) * 100;
  return Math.round(margin * 10) / 10; // 小数点以下1位に丸める
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
  const fuelSurcharge = Math.round(shippingPrice * FUEL_SURCHARGE_RATE);
  return shippingPrice + fuelSurcharge;
};
