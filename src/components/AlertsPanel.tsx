"use client";

import { useState, useEffect } from "react";
import { Bell, TrendingUp, TrendingDown, X, Plus, Trash2 } from "lucide-react";

interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  currentPrice: number;
  triggered: boolean;
}

interface AlertData {
  coins: { id: string; symbol: string; name: string; image: string; current_price: number }[];
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [coins, setCoins] = useState<AlertData["coins"]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    fetchCoins();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      // Use mock data
      setAlerts([
        { id: "1", symbol: "BTC", targetPrice: 80000, condition: "above", currentPrice: 77206, triggered: false },
        { id: "2", symbol: "ETH", targetPrice: 2000, condition: "below", currentPrice: 2115, triggered: false },
        { id: "3", symbol: "SOL", targetPrice: 200, condition: "above", currentPrice: 172, triggered: false },
      ]);
    }
    setLoading(false);
  };

  const fetchCoins = async () => {
    try {
      const res = await fetch("/api/market");
      const data = await res.json();
      setCoins(data.coins.slice(0, 20));
    } catch (err) {
      // Use mock data
      setCoins([
        { id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "", current_price: 77206 },
        { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "", current_price: 2115 },
        { id: "solana", symbol: "SOL", name: "Solana", image: "", current_price: 172 },
      ]);
    }
  };

  const addAlert = () => {
    if (!selectedCoin || !targetPrice) return;

    const coin = coins.find((c) => c.id === selectedCoin);
    if (!coin) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol: coin.symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      condition,
      currentPrice: coin.current_price,
      triggered: false,
    };

    setAlerts([...alerts, newAlert]);
    setShowForm(false);
    setSelectedCoin("");
    setTargetPrice("");
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const getProgress = (alert: Alert) => {
    const diff = alert.targetPrice - alert.currentPrice;
    const range = alert.condition === "above" ? diff : -diff;
    const percent = Math.min(100, Math.max(0, (range / alert.currentPrice) * 100 + 50));
    return percent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Bell className="w-8 h-8 animate-pulse text-[#00d4aa]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Price Alerts</h2>
          <p className="text-sm text-[#8b8b9e]">Get notified when price hits your target</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {/* Add Alert Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Create Alert</h3>
            <button onClick={() => setShowForm(false)} className="text-[#8b8b9e] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-[#8b8b9e] mb-1 block">Coin</label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full p-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white"
              >
                <option value="">Select coin</option>
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol.toUpperCase()} - {coin.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8b8b9e] mb-1 block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as "above" | "below")}
                className="w-full p-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8b8b9e] mb-1 block">Target Price (USD)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white"
              />
            </div>
            <div className="flex items-end">
              <button onClick={addAlert} className="w-full py-2 bg-[#00d4aa] text-black font-medium rounded-lg">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="card">
        <div className="p-4 border-b border-[#1e1e2a]">
          <h3 className="text-sm font-semibold">Active Alerts ({alerts.length})</h3>
        </div>
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-[#8b8b9e]">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No alerts yet. Create one to get started.</p>
          </div>
        ) : (
          <div>
            {alerts.map((alert) => (
              <div key={alert.id} className="token-row">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.condition === "above" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {alert.condition === "above" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{alert.symbol}</div>
                    <div className="text-xs text-[#8b8b9e]">
                      Alert when {alert.condition} ${alert.targetPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-8">
                  <div className="flex items-center justify-between text-xs text-[#8b8b9e] mb-1">
                    <span>Current: ${alert.currentPrice.toLocaleString()}</span>
                    <span>Target: ${alert.targetPrice.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${alert.condition === "above" ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${getProgress(alert)}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-[#8b8b9e] hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-[#00d4aa]">{alerts.length}</div>
          <div className="text-xs text-[#8b8b9e]">Active Alerts</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-400">
            {alerts.filter((a) => a.condition === "above").length}
          </div>
          <div className="text-xs text-[#8b8b9e]">Buy Signals</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-400">
            {alerts.filter((a) => a.condition === "below").length}
          </div>
          <div className="text-xs text-[#8b8b9e]">Sell Signals</div>
        </div>
      </div>
    </div>
  );
}
