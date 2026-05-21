const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface ChartData {
  prices: [number, number][];
}

export async function getTopCoins(limit = 10): Promise<CoinData[]> {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
  );
  if (!res.ok) throw new Error("Failed to fetch coins");
  return res.json();
}

export async function getCoinChart(coinId: string, days = 7): Promise<ChartData> {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );
  if (!res.ok) throw new Error("Failed to fetch chart");
  return res.json();
}

export async function getGlobalData() {
  const res = await fetch(`${COINGECKO_BASE}/global`);
  if (!res.ok) throw new Error("Failed to fetch global data");
  const data = await res.json();
  return data.data;
}
