'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export function BalanceDisplay() {
  const [balance, setBalance] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/maintainer/balance');
      const data = await response.json();

      if (data.success && data.data) {
        setBalance(data.data.usdc_balance);
        setAddress(data.data.wallet_address);
      } else {
        setError(data.message || 'Failed to fetch');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-mid border border-border-subtle rounded-2xl">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Wallet size={12} className="text-accent" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Balance</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          ) : error ? (
            <div className="flex items-center gap-1 text-red-500" title={error}>
              <AlertCircle size={14} />
              <span className="text-xs font-black uppercase">Service Error</span>
            </div>
          ) : (
            <span className="text-sm font-black text-foreground">{balance} USDC</span>
          )}
        </div>
      </div>

      <button
        onClick={fetchBalance}
        className="p-2 hover:bg-surface-high rounded-xl transition-colors text-muted-foreground hover:text-accent"
        title="Refresh Balance"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
