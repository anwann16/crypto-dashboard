"use client";

import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  Settings,
  Bell,
  Star,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "market", label: "Market", icon: TrendingUp },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "watchlist", label: "Watchlist", icon: Star },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sidebar w-64 h-screen flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center">
          <span className="text-black font-bold text-lg">₿</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-white">CryptoDash</h1>
          <p className="text-[10px] text-[#8b8b9e]">Portfolio Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item w-full text-left ${
              activeTab === item.id ? "active" : ""
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>


    </aside>
  );
}
