"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon, RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CoinData {
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

interface DashboardProps {
  walletAddress: string | null;
}

export default function Dashboard({ walletAddress }: DashboardProps) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [globalData, setGlobalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setCoins(data.coins);
      setGlobalData(data.global);
      setLastUpdate(new Date());
    } catch (err) {
      setError("Failed to fetch market data. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mock holdings
  const holdings = [
    { id: "bitcoin", amount: 0.5 },
    { id: "ethereum", amount: 4.2 },
    { id: "solana", amount: 25 },
    { id: "cardano", amount: 500 },
    { id: "ripple", amount: 1000 },
  ];

  const portfolioValue = holdings.reduce((sum, h) => {
    const coin = coins.find((c) => c.id === h.id);
    return sum + (coin ? coin.current_price * h.amount : 0);
  }, 0);

  const portfolioChange = holdings.reduce((sum, h) => {
    const coin = coins.find((c) => c.id === h.id);
    return sum + (coin ? (coin.price_change_percentage_24h * h.amount * coin.current_price) / 100 : 0);
  }, 0);

  const portfolioChangePercent = portfolioValue > 0
    ? ((portfolioChange / portfolioValue) * 100).toFixed(2)
    : "0.00";

  // Chart data from Bitcoin sparkline
  const chartData = coins[0]?.sparkline_in_7d?.price
    ?.filter((_, i) => i % 6 === 0)
    .map((price, i) => ({
      hour: i,
      price,
    })) || [];

  // Allocation data
  const allocationData = holdings.map((h) => {
    const coin = coins.find((c) => c.id === h.id);
    const value = coin ? coin.current_price * h.amount : 0;
    return {
      name: coin?.symbol?.toUpperCase() || h.id,
      value: portfolioValue > 0 ? Number(((value / portfolioValue) * 100).toFixed(1)) : 0,
      color: getCoinColor(h.id),
    };
  });

  function getCoinColor(id: string): string {
    const colors: Record<string, string> = {
      bitcoin: "#f7931a",
      ethereum: "#627eea",
      solana: "#00ffa3",
      cardano: "#0033ad",
      ripple: "#00aae4",
    };
    return colors[id] || "#8b8b9e";
  }

  if (loading && coins.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#00d4aa]" />
          <p className="text-sm text-[#8b8b9e]">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="card p-4 border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm">
          {error}
        </div>
      )}

      {/* Last Update */}
      <div className="flex items-center justify-between text-xs text-[#8b8b9e]">
        <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        <button onClick={fetchData} className="flex items-center gap-1 hover:text-[#00d4aa]">
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Portfolio Value</span>
            <DollarSign className="w-4 h-4 text-[#8b8b9e]" />
          </div>
          <div className="stat-value">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className={`stat-change ${Number(portfolioChangePercent) >= 0 ? "positive" : "negative"}`}>
            {Number(portfolioChangePercent) >= 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
            {Number(portfolioChangePercent) >= 0 ? "+" : ""}{portfolioChangePercent}% (24h)
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">24h Profit/Loss</span>
            <BarChart3 className="w-4 h-4 text-[#8b8b9e]" />
          </div>
          <div className={`stat-value ${portfolioChange >= 0 ? "positive" : "negative"}`}>
            {portfolioChange >= 0 ? "+" : ""}${Math.abs(portfolioChange).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className={`stat-change ${portfolioChange >= 0 ? "positive" : "negative"}`}>
            {portfolioChange >= 0 ? "Profit" : "Loss"} today
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Market Cap</span>
            <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
          </div>
          <div className="stat-value">
            {globalData ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(2)}T` : "-"}
          </div>
          <div className={`stat-change ${globalData?.market_cap_change_percentage_24h_usd >= 0 ? "positive" : "negative"}`}>
            {globalData?.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}
            {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}% today
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Assets</span>
            <PieChartIcon className="w-4 h-4 text-[#8b8b9e]" />
          </div>
          <div className="stat-value">{holdings.length}</div>
          <div className="stat-change text-[#8b8b9e]">Tracked assets</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="card p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Bitcoin (7 Days)</h3>
              <p className="text-xs text-[#8b8b9e]">Price trend</p>
            </div>
            {coins[0] && (
              <div className="text-right">
                <div className="text-lg font-bold">${coins[0].current_price.toLocaleString()}</div>
                <div className={`text-xs ${coins[0].price_change_percentage_24h >= 0 ? "text-[#00d4aa]" : "text-[#ff4757]"}`}>
                  {coins[0].price_change_percentage_24h >= 0 ? "+" : ""}
                  {coins[0].price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                <XAxis dataKey="hour" stroke="#8b8b9e" fontSize={12} />
                <YAxis stroke="#8b8b9e" fontSize={12} domain={["auto", "auto"]} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "#16161f",
                    border: "1px solid #1e1e2a",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#00d4aa"
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Allocation Pie */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#16161f",
                  border: "1px solid #1e1e2a",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}%`, "Allocation"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-[#8b8b9e]">{item.name}</span>
                <span className="ml-auto text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e2a]">
          <h3 className="text-sm font-semibold">Market Overview</h3>
          <span className="text-xs text-[#8b8b9e]">Top 10 by Market Cap</span>
        </div>
        <div>
          {coins.slice(0, 8).map((coin, index) => (
            <div key={coin.id} className="token-row">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8b8b9e] w-4">{index + 1}</span>
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                  <div className="text-xs text-[#8b8b9e]">{coin.name}</div>
                </div>
              </div>
              <div className="flex-1 text-right">
                <div className="font-medium">${coin.current_price.toLocaleString()}</div>
                <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? "text-[#00d4aa]" : "text-[#ff4757]"}`}>
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
              <div className="text-right ml-8 min-w-[100px]">
                <div className="text-sm text-[#8b8b9e]">
                  ${(coin.total_volume / 1e9).toFixed(2)}B
                </div>
                <div className="text-[10px] text-[#8b8b9e]">Volume</div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
