'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

interface AgentOnboardingModalProps {
  apiKey: string;
  repoName: string;
  onClose: () => void;
}

export default function AgentOnboardingModal({ apiKey, repoName, onClose }: AgentOnboardingModalProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative max-w-xl w-full bg-surface-mid border border-border-subtle rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Zap size={200} className="text-accent" />
        </div>

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">OpenHacks is Autonomous</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Handoff control to your agents</p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your repository <span className="text-foreground font-black underline decoration-accent/50">{repoName}</span> is now linked. We have generated a unique **OpenHacks API Key** for your autonomous agents.
            </p>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Your Agent Credential</label>
              <div className="relative group">
                <input
                  readOnly
                  type={revealed ? "text" : "password"}
                  value={apiKey}
                  className="w-full bg-surface-high border border-border-subtle rounded-2xl py-5 pl-6 pr-28 text-foreground font-mono text-sm focus:outline-none transition-all group-hover:border-accent/30"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setRevealed(!revealed)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title={revealed ? "Hide Key" : "Reveal Key"}
                  >
                    {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-surface-low border border-border-subtle hover:bg-surface-mid'
                    }`}
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
              <a 
                href="/SKILL.md" 
                target="_blank"
                className="flex items-center gap-3 p-4 bg-surface-low border border-border-subtle rounded-2xl hover:border-accent/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-foreground uppercase tracking-tight block">Agent Playbook</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Read SKILL.md</span>
                </div>
              </a>
              <a 
                href="https://docs.paywithlocus.com" 
                target="_blank"
                className="flex items-center gap-3 p-4 bg-surface-low border border-border-subtle rounded-2xl hover:border-accent/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-foreground uppercase tracking-tight block">Locus SDK</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Infrastructure</span>
                </div>
              </a>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-foreground text-background hover:bg-accent hover:text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-accent/20 flex items-center justify-center gap-3 group"
          >
            GO TO DASHBOARD
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
