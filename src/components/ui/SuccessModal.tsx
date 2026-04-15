'use client';

import React from 'react';
import { CheckCircle2, Zap, ArrowRight, Plus, ExternalLink, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionHref?: string;
  actionText?: string;
  isError?: boolean;
  hideSecondaryAction?: boolean;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  actionHref = "/",
  actionText = "Dashboard",
  isError = false,
  hideSecondaryAction = false
}: SuccessModalProps) {
  if (!isOpen) return null;

  const accentColor = isError ? "red-500" : "accent";

  const [hasClickedCheckout, setHasClickedCheckout] = React.useState(false);

  const handleCheckoutClick = () => {
    setHasClickedCheckout(true);
  };

  const handleVerify = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Confetti */}
      {confetti.map(p => (
        <div 
          key={p.id}
          className="confetti"
          style={{ 
            left: p.left, 
            backgroundColor: p.color, 
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className={`relative w-full max-w-lg bg-surface-low border ${isError ? 'border-red-500/30' : 'border-border-subtle'} rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out`}>
        {/* Decorative background signal */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 ${isError ? 'bg-red-500/20' : 'bg-accent/20'} blur-[100px] -z-10 rounded-full`} />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-surface-high rounded-xl"
        >
          <X size={20} />
        </button>

        <div className="p-10 md:p-14 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-[2rem] ${isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-accent/10 border-accent/20 text-accent'} border flex items-center justify-center mb-10 relative`}>
            {isError ? (
              <AlertCircle size={48} className="animate-in zoom-in-50 duration-500 delay-150" />
            ) : (
              <CheckCircle2 size={48} className="animate-in zoom-in-50 duration-500 delay-150" />
            )}
            <div className={`absolute -inset-4 ${isError ? 'bg-red-500/20' : 'bg-accent/20'} rounded-full blur-2xl animate-pulse`} />
          </div>

          <h3 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4 italic">{hasClickedCheckout ? 'Awaiting Payment' : title}</h3>
          <p className="text-muted-foreground font-medium mb-12 leading-relaxed text-lg">
            {hasClickedCheckout 
              ? 'Please finish the escrow payment in the new tab. Once done, click the refresh button below.' 
              : message}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {!isError ? (
              <>
                {!hasClickedCheckout ? (
                  <a
                    href={actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCheckoutClick}
                    className="flex-1 py-5 bg-accent hover:bg-accent-hover text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-accent/40 active:scale-95 no-underline"
                  >
                    <Zap size={16} fill="currentColor" />
                    {actionText}
                  </a>
                ) : (
                  <button
                    onClick={handleVerify}
                    className="flex-1 py-5 bg-surface-high border-2 border-accent text-accent rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    I've Paid, Refresh Dashboard
                  </button>
                )}
                
                {!hideSecondaryAction && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-5 bg-surface-mid border border-border-subtle text-foreground rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest hover:bg-surface-high transition-colors flex items-center justify-center gap-2 box-border active:scale-95"
                  >
                    <Plus size={16} />
                    Post Another
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-5 bg-red-500 hover:bg-red-600 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-red-500/40 active:scale-95"
              >
                TRY AGAIN
              </button>
            )}
          </div>
        </div>

        <div className={`h-1.5 ${isError ? 'bg-red-500' : 'bg-gradient-to-r from-transparent via-accent to-transparent'} opacity-50`} />
      </div>
    </div>
  );
}
