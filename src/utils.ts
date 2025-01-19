import { FUEL_SURCHARGE_RATE, SHIPPING_PRICE_LIST } from "./constants";
import { Item as IItem } from "@/interfaces";

export const getMargin = (
  item: Partial<IItem>,
  exchangeRate: number | null
): number => {
  if (!exchangeRate) return 0;
  const { price = 0, cost = 0, weight = 0, promote = 0 } = item;
  const priceInYen = price * exchangeRate;
  const freight = getFreight(weight);
  const promotePriceInYen = price * (promote / 100) * exchangeRate;
  return Math.trunc(priceInYen - cost - freight - promotePriceInYen);
};

export const getFreight = (weight: number): number => {
  const shippingPrice =
    SHIPPING_PRICE_LIST.filter((entry) => entry.weight <= weight).sort(
      (a, b) => b.weight - a.weight
    )[0]?.price || 0;
  const fuelSurcharge = shippingPrice * FUEL_SURCHARGE_RATE;
  return shippingPrice + fuelSurcharge;
};
