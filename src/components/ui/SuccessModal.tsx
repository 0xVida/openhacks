'use client';

import React from 'react';
import { CheckCircle2, Zap, Plus, X, AlertCircle, Loader2 } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionHref?: string;
  actionText?: string;
  isError?: boolean;
  hideSecondaryAction?: boolean;
  sessionId?: string;
  bountyId?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  actionHref = "/",
  actionText = "Dashboard",
  isError = false,
  hideSecondaryAction = false,
  sessionId,
  bountyId
}: SuccessModalProps) {
  const [hasClickedCheckout, setHasClickedCheckout] = React.useState(false);
  const [confetti, setConfetti] = React.useState<any[]>([]);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && !isError) {
      const colors = ['#6366f1', '#818cf8', '#a78bfa', '#f472b6', '#fbbf24'];
      const particles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 2}s`,
        size: `${Math.random() * 8 + 4}px`
      }));
      setConfetti(particles);

      const timer = setTimeout(() => setConfetti([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isError]);

  // Polling logic
  React.useEffect(() => {
    let intervalId: any;

    if (isOpen && hasClickedCheckout && sessionId && bountyId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/maintainer/bounty/status?sessionId=${sessionId}&bountyId=${bountyId}`);
          const data = await res.json();
          if (data.success && data.isFunded) {
            // SUCCESS! The proxy already updated the DB.
            setIsVerifying(false);
            window.location.href = '/?payment_success=true';
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, hasClickedCheckout, sessionId, bountyId]);

  const handleCheckoutClick = () => {
    setHasClickedCheckout(true);
  };

  const handleVerifyManually = async () => {
    if (!sessionId || !bountyId) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch(`/api/maintainer/bounty/status?sessionId=${sessionId}&bountyId=${bountyId}`);
      const data = await res.json();

      if (data.success && data.isFunded) {
        window.location.href = '/?payment_success=true';
      } else {
        setVerificationError("Still waiting for payment. Please complete the Locus checkout first.");
        setIsVerifying(false);
      }
    } catch (e) {
      setVerificationError("Technical error during verification. Please try again.");
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

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

          <h3 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4 italic">
            {hasClickedCheckout ? 'Awaiting Payment' : title}
          </h3>
          <p className="text-muted-foreground font-medium mb-12 leading-relaxed text-lg">
            {hasClickedCheckout
              ? 'Finish the payment in the new tab. This window will automatically update once it detects the payment confirmation.'
              : message}
          </p>

          {verificationError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={16} />
              {verificationError}
            </div>
          )}

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
                    disabled={isVerifying}
                    onClick={handleVerifyManually}
                    className="flex-1 py-5 bg-surface-high border-2 border-accent text-accent rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {isVerifying ? 'Verifying...' : 'Verify Status'}
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
