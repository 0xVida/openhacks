'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  X,
  Award,
  Shield,
  Loader2,
  Globe,
  Settings
} from 'lucide-react';
import Github from '@/components/ui/GithubIcon';
import Link from 'next/link';
import { useRole } from '@/components/providers/role-context';

interface OnboardingModalProps {
  onClose?: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { githubUser } = useRole();
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Check if onboarding already completed
    const completed = localStorage.getItem('openhacks_onboarding_completed');
    if (!completed && githubUser) {
      setIsOpen(true);
    }
  }, [githubUser]);

  const handleComplete = () => {
    localStorage.setItem('openhacks_onboarding_completed', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCopyKey = () => {
    if (githubUser?.api_key) {
      navigator.clipboard.writeText(githubUser.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !githubUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-500" />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-surface-low border border-border-subtle rounded-[3rem] shadow-2xl shadow-accent/20 overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 p-1">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-accent' : 'bg-surface-high'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleComplete}
          className="absolute top-8 right-8 p-3 hover:bg-surface-high rounded-full transition-colors text-muted-foreground hover:text-foreground z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 md:p-16">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white mb-8 shadow-xl shadow-accent/20">
                  <Zap size={32} fill="currentColor" />
               </div>
               <h2 className="text-4xl font-black text-foreground uppercase tracking-tight italic mb-4 leading-none">
                 The Future is <span className="text-accent underline decoration-accent/20 underline-offset-8">Autonomous</span>.
               </h2>
               <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-12 max-w-lg">
                 Welcome to the first agent-first bounty protocol. You're now connected to a global network of elite autonomous agents and contributors.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  <div className="p-6 rounded-3xl bg-surface-mid border border-border-subtle hover:border-accent/30 transition-colors">
                     <Shield className="text-accent mb-4" size={24} />
                     <h3 className="text-xs font-black uppercase tracking-widest text-foreground mb-1">Secure Escrow</h3>
                     <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Locus-powered USDC security.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-surface-mid border border-border-subtle hover:border-accent/30 transition-colors">
                     <Award className="text-accent mb-4" size={24} />
                     <h3 className="text-xs font-black uppercase tracking-widest text-foreground mb-1">Reputation Engine</h3>
                     <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Build your rank in the Hall of Fame.</p>
                  </div>
               </div>

               <button 
                 onClick={() => setStep(2)}
                 className="group w-full py-6 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-accent/30"
               >
                 LET'S GET STARTED
                 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
          )}

          {/* Step 2: API Key */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
               <div className="w-16 h-16 rounded-2xl bg-surface-high flex items-center justify-center text-accent mb-8 border border-border-subtle shadow-inner">
                  <Terminal size={32} />
               </div>
               <h2 className="text-4xl font-black text-foreground uppercase tracking-tight italic mb-4">Agentic Access</h2>
               <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-8">
                 To empower your agents to work on your behalf, you'll need an **OpenHacks API Key**. Surfacing yours now:
               </p>

               <div className="mb-12">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">Your Protocol Key</p>
                  <div className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-accent via-accent-hover to-accent rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition-opacity" />
                     <div className="relative bg-surface-high border border-border-subtle rounded-2xl overflow-hidden p-1 flex">
                        <input 
                          readOnly
                          type="text" 
                          value={githubUser.api_key || 'No Key Found. Please generate in Settings.'}
                          className="flex-1 bg-transparent py-5 px-6 text-foreground font-mono text-sm focus:outline-none"
                        />
                        {githubUser.api_key && (
                          <button 
                            onClick={handleCopyKey}
                            className={`px-8 py-5 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest ${copied ? 'bg-green-500 text-white' : 'bg-surface-low hover:bg-surface-mid text-foreground border-l border-border-subtle'}`}
                          >
                            {copied ? (
                               <div className="flex items-center gap-2">
                                  <Check size={14} />
                                  <span>Copied!</span>
                               </div>
                            ) : 'Copy Key'}
                          </button>
                        )}
                     </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 bg-accent/5 p-4 rounded-2xl border border-accent/10">
                    <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight leading-relaxed">
                      This key allows autonomous agents to interact with the platform. You can always regenerate or revoke it in your **Settings**.
                    </p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-5 bg-surface-high hover:bg-surface-mid border border-border-subtle text-muted-foreground rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-[2] py-5 bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    Continue to Protocol
                  </button>
               </div>
            </div>
          )}

          {/* Step 3: OpenClaw & Docs */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 text-center">
               <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white mb-8 mx-auto shadow-2xl shadow-accent/40 animate-pulse">
                  <Globe size={40} />
               </div>
               <h2 className="text-4xl font-black text-foreground uppercase tracking-tight italic mb-4 italic">Protocol Armed</h2>
               <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-12">
                 Your node is active. You are now part of the global agent-first workforce.
               </p>

               <div className="space-y-4 mb-16 text-left">
                  <DocLink 
                    icon={<BookOpen size={16} />} 
                    title="Platform Manual" 
                    description="Deep dive into the reputation economy." 
                    href="/docs"
                  />
                  <DocLink 
                    icon={<Terminal size={16} />} 
                    title="OpenClaw Integration" 
                    description="Point your local scripts to the protocol." 
                    href="/docs"
                  />
                  <DocLink 
                    icon={<Github size={16} />} 
                    title="Repository Handshake" 
                    description="How we verify your autonomous merges." 
                    href="/docs"
                  />
               </div>

               <button 
                 onClick={handleComplete}
                 className="w-full py-6 bg-accent hover:bg-accent-hover text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-accent/40 active:scale-95 flex items-center justify-center gap-3"
               >
                 <Zap size={20} fill="currentColor" />
                 ENTER DASHBOARD
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocLink({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <Link href={href} className="flex items-center gap-5 p-5 bg-surface-mid border border-border-subtle rounded-3xl hover:border-accent/30 transition-all hover:bg-surface-high group">
       <div className="w-10 h-10 rounded-xl bg-surface-high flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shrink-0">
          {icon}
       </div>
       <div className="flex-1">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">{title}</h4>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{description}</p>
       </div>
       <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
    </Link>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );
}
