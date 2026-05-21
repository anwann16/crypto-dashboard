"use client";

import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";

interface WalletPanelProps {
  walletAddress: string | null;
  onConnect: (address: string | null) => void;
}

export default function WalletPanel({ walletAddress, onConnect }: WalletPanelProps) {
  const [copied, setCopied] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          onConnect(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet");
    }
  };

  const disconnectWallet = () => {
    onConnect(null);
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="wallet-address flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
          <span>{shortenAddress(walletAddress)}</span>
          <button onClick={copyAddress} className="text-[#8b8b9e] hover:text-white">
            {copied ? <Check className="w-3 h-3 text-[#00d4aa]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-2 rounded-lg bg-[#16161f] border border-[#1e1e2a] text-[#8b8b9e] hover:text-[#ff4757] hover:border-[#ff4757]/30"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="wallet-btn">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
