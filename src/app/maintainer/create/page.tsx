'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Settings2,
  Loader2
} from 'lucide-react';
import RootContainer from '@/components/layout/RootContainer';

type BountyType = 'issue';
type ExecutionMode = 'open' | 'proposal';

export default function CreateBountyPage() {
  const router = useRouter();
  const [type, setType] = useState<BountyType>('issue');
  const [mode, setMode] = useState<ExecutionMode>('proposal');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [repo, setRepo] = useState('openhacks-core');
  const [issueNumber, setIssueNumber] = useState('');
  const [reward, setReward] = useState('');

  const handleLaunchBounty = async () => {
    if (!title || !repo || !issueNumber || !reward) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/maintainer/bounty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          repo,
          issueNumber,
          reward: parseFloat(reward),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Bounty launched successfully! Funds are now locked in escrow.');
        router.push('/quests');
      } else {
        alert(`Failed to launch bounty: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error('Error launching bounty:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
               <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Bounty Details</h2>
               <div className="bg-surface-mid border border-border-subtle rounded-3xl p-8 space-y-6">
                  <div className="space-y-4">
                     <label className="text-xs font-black text-foreground uppercase tracking-widest block">Bounty Title</label>
                     <input 
                       disabled={isLoading}
                       type="text" 
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                       placeholder="e.g. Implement Locus payment hook..." 
                       className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-accent/50 font-bold placeholder:opacity-30"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest block">Repository</label>
                       <div className="relative group">
                          <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
                          <select 
                            disabled={isLoading}
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent/50 appearance-none font-bold"
                          >
                             <option value="openhacks-core">openhacks-core</option>
                             <option value="openhacks-ui">openhacks-ui</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest block">Issue Number</label>
                       <input 
                         disabled={isLoading}
                         type="number" 
                         value={issueNumber}
                         onChange={(e) => setIssueNumber(e.target.value)}
                         placeholder="#123" 
                         className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-accent/50 font-bold"
                       />
                    </div>
                  </div>
               </div>
            </section>

            <section>
               <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Workflow Mode</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 flex flex-col gap-4">
                       <label className="text-xs font-black text-foreground uppercase tracking-widest">Execution Style</label>
                       <div className="flex bg-surface-high p-1 rounded-2xl border border-border-subtle">
                          <button 
                            disabled={isLoading}
                            onClick={() => setMode('proposal')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${
                              mode === 'proposal' ? 'bg-accent text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <UserCheck size={16} />
                            Proposal
                          </button>
                          <button 
                            disabled={isLoading}
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
                       <label className="text-xs font-black text-foreground uppercase tracking-widest">Reward Pool (USDC)</label>
                       <div className="relative group">
                          <Trophy className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={24} />
                          <input 
                            disabled={isLoading}
                            type="number" 
                            value={reward}
                            onChange={(e) => setReward(e.target.value)}
                            placeholder="Amount" 
                            className="w-full bg-surface-high border-2 border-accent/20 rounded-2xl py-6 pl-16 pr-6 text-2xl font-black text-foreground focus:outline-none focus:border-accent shadow-inner transition-all placeholder:text-muted-foreground/30"
                          />
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            <div className="pt-12 border-t border-border-subtle flex flex-col sm:flex-row gap-4">
               <button 
                disabled={isLoading}
                onClick={handleLaunchBounty}
                className={`flex-[2] py-5 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black transition-all shadow-2xl shadow-accent/30 tracking-tight flex items-center justify-center gap-3 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
               >
                  {isLoading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <Zap size={22} fill="currentColor" />
                  )}
                  {isLoading ? 'LAUNCHING...' : 'LAUNCH BOUNTY'}
               </button>
               <button 
                disabled={isLoading}
                className="flex-1 py-5 bg-surface-mid hover:bg-surface-high border border-border-subtle text-foreground rounded-3xl font-black transition-all tracking-tight flex items-center justify-center gap-2"
               >
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
