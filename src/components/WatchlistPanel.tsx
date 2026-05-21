"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, TrendingDown, Trash2, RefreshCw } from "lucide-react";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export default function WatchlistPanel() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [availableCoins, setAvailableCoins] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/market");
      const data = await res.json();
      setAvailableCoins(data.coins);
      
      // Load watchlist from localStorage
      const savedWatchlist = localStorage.getItem("watchlist");
      if (savedWatchlist) {
        const watchlistIds = JSON.parse(savedWatchlist);
        const watchlistCoins = data.coins.filter((c: WatchlistItem) => watchlistIds.includes(c.id));
        setWatchlist(watchlistCoins);
      } else {
        // Default watchlist
        const defaultIds = ["bitcoin", "ethereum", "solana", "ripple", "cardano"];
        const defaultCoins = data.coins.filter((c: WatchlistItem) => defaultIds.includes(c.id));
        setWatchlist(defaultCoins);
        localStorage.setItem("watchlist", JSON.stringify(defaultIds));
      }
      setLastUpdate(new Date());
    } catch (err) {
      // Mock data
      setWatchlist([
        { id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "", current_price: 77206, price_change_percentage_24h: -0.40, market_cap: 1546000000000 },
        { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "", current_price: 2115, price_change_percentage_24h: -0.79, market_cap: 255000000000 },
        { id: "solana", symbol: "SOL", name: "Solana", image: "", current_price: 172, price_change_percentage_24h: 5.67, market_cap: 80000000000 },
      ]);
    }
    setLoading(false);
  };

  const addToWatchlist = (coin: WatchlistItem) => {
    if (watchlist.find((w) => w.id === coin.id)) return;
    const newWatchlist = [...watchlist, coin];
    setWatchlist(newWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist.map((w) => w.id)));
  };

  const removeFromWatchlist = (id: string) => {
    const newWatchlist = watchlist.filter((w) => w.id !== id);
    setWatchlist(newWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist.map((w) => w.id)));
  };

  const totalValue = watchlist.reduce((sum, c) => sum + c.current_price, 0);
  const avgChange = watchlist.length > 0
    ? watchlist.reduce((sum, c) => sum + c.price_change_percentage_24h, 0) / watchlist.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00d4aa]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Watchlist</h2>
          <p className="text-sm text-[#8b8b9e]">Track your favorite coins • Last update: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-[#8b8b9e] hover:text-[#00d4aa]">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold">{watchlist.length}</div>
          <div className="text-xs text-[#8b8b9e]">Coins Tracked</div>
        </div>
        <div className="card p-4">
          <div className={`text-2xl font-bold ${avgChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
          </div>
          <div className="text-xs text-[#8b8b9e]">Avg 24h Change</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-[#00d4aa]">
            ${(totalValue).toLocaleString()}
          </div>
          <div className="text-xs text-[#8b8b9e]">Combined Price</div>
        </div>
      </div>

      {/* Watchlist */}
      <div className="card">
        <div className="p-4 border-b border-[#1e1e2a]">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            My Watchlist
          </h3>
        </div>
        {watchlist.length === 0 ? (
          <div className="p-8 text-center text-[#8b8b9e]">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Your watchlist is empty. Add coins to track them.</p>
          </div>
        ) : (
          <div>
            {watchlist.map((coin, index) => (
              <div key={coin.id} className="token-row">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8b8b9e] w-4">{index + 1}</span>
                  {coin.image && <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />}
                  <div>
                    <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                    <div className="text-xs text-[#8b8b9e]">{coin.name}</div>
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">${coin.current_price.toLocaleString()}</div>
                  <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                    {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3 inline ml-1" /> : <TrendingDown className="w-3 h-3 inline ml-1" />}
                  </div>
                </div>
                <div className="text-right ml-8 min-w-[100px]">
                  <div className="text-sm text-[#8b8b9e]">
                    ${(coin.market_cap / 1e9).toFixed(1)}B
                  </div>
                  <div className="text-[10px] text-[#8b8b9e]">Market Cap</div>
                </div>
                <button
                  onClick={() => removeFromWatchlist(coin.id)}
                  className="ml-4 p-2 text-[#8b8b9e] hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Coins */}
      <div className="card">
        <div className="p-4 border-b border-[#1e1e2a]">
          <h3 className="text-sm font-semibold">Add to Watchlist</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {availableCoins
              .filter((c) => !watchlist.find((w) => w.id === c.id))
              .slice(0, 8)
              .map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => addToWatchlist(coin)}
                  className="p-3 bg-gray-900/30 border border-gray-800 rounded-lg text-left hover:border-[#00d4aa]/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {coin.image && <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />}
                    <div>
                      <div className="text-xs font-medium">{coin.symbol.toUpperCase()}</div>
                      <div className={`text-[10px] ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {coin.price_change_percentage_24h?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
