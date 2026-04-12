'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Zap, 
  Video, 
  Palette, 
  Code2, 
  UserCheck, 
  Trophy,
  Info,
  ChevronRight,
  Globe,
  Settings2
} from 'lucide-react';
import RootContainer from '@/components/layout/RootContainer';

type BountyType = 'issue' | 'quest';
type ExecutionMode = 'open' | 'proposal';

export default function CreateBountyPage() {
  const [type, setType] = useState<BountyType>('issue');
  const [mode, setMode] = useState<ExecutionMode>('proposal');

  return (
    <RootContainer>
      <div className="flex-1 bg-surface-low overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-12 lg:p-16">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-tight">Back to Dashboard</span>
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">Create New Bounty</h1>
            <p className="text-muted-foreground font-medium text-lg">Define how you want contributors to help your project.</p>
          </header>

          <div className="space-y-12">
            <section>
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Step 1: Selection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setType('issue')}
                  className={`p-6 rounded-3xl border transition-all text-left group relative overflow-hidden ${
                    type === 'issue' 
                      ? 'bg-accent/5 border-accent shadow-xl shadow-accent/5' 
                      : 'bg-surface-mid border-border-subtle hover:border-accent/40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                    type === 'issue' ? 'bg-accent text-white' : 'bg-surface-high text-muted-foreground group-hover:text-accent'
                  }`}>
                    <Code2 size={24} />
                  </div>
                  <h3 className="font-black text-foreground text-xl uppercase tracking-tight mb-2">Technical Issue</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Fix bugs or build features from your GitHub repository.</p>
                </button>

                <button 
                  onClick={() => setType('quest')}
                  className={`p-6 rounded-3xl border transition-all text-left group relative overflow-hidden ${
                    type === 'quest' 
                      ? 'bg-accent/5 border-accent shadow-xl shadow-accent/5' 
                      : 'bg-surface-mid border-border-subtle hover:border-accent/40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                    type === 'quest' ? 'bg-accent text-white' : 'bg-surface-high text-muted-foreground group-hover:text-accent'
                  }`}>
                    <Video size={24} />
                  </div>
                  <h3 className="font-black text-foreground text-xl uppercase tracking-tight mb-2">Creative Quest</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Market your project through videos, design, or social content.</p>
                </button>
              </div>
            </section>

            <section>
               <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Step 2: Details</h2>
               <div className="bg-surface-mid border border-border-subtle rounded-3xl p-8 space-y-6">
                  {type === 'issue' ? (
                    <div className="space-y-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest block">Select Repository</label>
                       <div className="relative group">
                          <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
                          <select className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent/50 appearance-none font-bold">
                             <option>openbags-core / main</option>
                             <option>openbags-ui / master</option>
                          </select>
                       </div>
                       <p className="text-[10px] text-muted-foreground font-bold italic px-2">Showing repos you have maintainer access to.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest block">Quest Objective</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Create a 60s explainer video for our DAO..." 
                         className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-accent/50 font-bold placeholder:opacity-30"
                       />
                    </div>
                  )}
               </div>
            </section>

            <section>
               <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Step 3: Workflow Mode</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 flex flex-col gap-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest">Execution Style</label>
                       <div className="flex bg-surface-high p-1 rounded-2xl border border-border-subtle">
                          <button 
                            onClick={() => setMode('proposal')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${
                              mode === 'proposal' ? 'bg-accent text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <UserCheck size={16} />
                            Proposal
                          </button>
                          <button 
                            onClick={() => setMode('open')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${
                              mode === 'open' ? 'bg-accent text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Zap size={16} />
                            Open
                          </button>
                       </div>
                       <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-black/5 p-3 rounded-xl border border-border-subtle italic leading-normal">
                          <Info size={14} className="shrink-0 text-accent opacity-70" />
                          {mode === 'proposal' 
                            ? "Contributors submit pitches. You manually select a winner to start work." 
                            : "Anyone can submit a solution. You pick the best implementation after the fact."}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 flex flex-col gap-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest">Reward Pool</label>
                       <div className="relative group">
                          <Trophy className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={24} />
                          <input 
                            type="number" 
                            placeholder="Points" 
                            className="w-full bg-surface-high border-2 border-accent/20 rounded-2xl py-6 pl-16 pr-6 text-2xl font-black text-foreground focus:outline-none focus:border-accent shadow-inner transition-all placeholder:text-muted-foreground/30"
                          />
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            <div className="pt-12 border-t border-border-subtle flex flex-col sm:flex-row gap-4">
               <button className="flex-[2] py-5 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black transition-all shadow-2xl shadow-accent/30 tracking-tight flex items-center justify-center gap-3 active:scale-[0.98]">
                  <Zap size={22} fill="currentColor" />
                  LAUNCH BOUNTY
               </button>
               <button className="flex-1 py-5 bg-surface-mid hover:bg-surface-high border border-border-subtle text-foreground rounded-3xl font-black transition-all tracking-tight flex items-center justify-center gap-2">
                  <Settings2 size={18} />
                  SAVE DRAFT
               </button>
            </div>
          </div>
        </div>
      </div>
    </RootContainer>
  );
}
