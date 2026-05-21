import { NextResponse } from "next/server";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export async function GET() {
  try {
    const [coinsRes, globalRes] = await Promise.all([
      fetch(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
        { next: { revalidate: 60 } }
      ),
      fetch(`${COINGECKO_BASE}/global`, { next: { revalidate: 120 } }),
    ]);

    if (!coinsRes.ok || !globalRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from CoinGecko" },
        { status: 502 }
      );
    }

    const coins = await coinsRes.json();
    const globalData = await globalRes.json();

    return NextResponse.json({
      coins,
      global: globalData.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
