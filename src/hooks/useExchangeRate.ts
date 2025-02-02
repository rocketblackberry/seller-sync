import { useState, useEffect } from "react";

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "";
const API_URL = process.env.ALPHA_VANTAGE_API_URL?.replace("$1", API_KEY) || "";
const CACHE_KEY = "exchangeRate";
const CACHE_TIMESTAMP_KEY = "exchangeRateTimestamp";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const cachedRate = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        const now = new Date().getTime();

        if (
          cachedRate &&
          cachedTimestamp &&
          now - parseInt(cachedTimestamp) < CACHE_DURATION
        ) {
          setExchangeRate(parseFloat(cachedRate));
          setLoading(false);
          return;
        }

        const response = await fetch(API_URL);
        const data = await response.json();
        const rate = parseFloat(
          data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        );

        localStorage.setItem(CACHE_KEY, rate.toString());
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

        setExchangeRate(rate);
      } catch (err) {
        setError("為替レートの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  return { exchangeRate, loading, error };
};

export default useExchangeRate;
