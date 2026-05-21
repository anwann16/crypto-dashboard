"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import WalletPanel from "@/components/WalletPanel";

const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {activeTab === "dashboard" && "Portfolio Overview"}
            {activeTab === "market" && "Market"}
            {activeTab === "wallet" && "Wallet"}
            {activeTab === "transactions" && "Transactions"}
          </h1>
          <WalletPanel
            walletAddress={walletAddress}
            onConnect={setWalletAddress}
          />
        </div>
        {activeTab === "dashboard" && <Dashboard walletAddress={walletAddress} />}
        {activeTab === "market" && <Dashboard walletAddress={walletAddress} />}
        {activeTab === "wallet" && <Dashboard walletAddress={walletAddress} />}
        {activeTab === "transactions" && <Dashboard walletAddress={walletAddress} />}
      </main>
    </div>
  );
}
