'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Link as LinkIcon, 
  FileUp, 
  Zap, 
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight
} from 'lucide-react';
import RootContainer from '@/components/layout/RootContainer';

const MOCK_QUEST = {
  id: 'q1',
  title: 'Create a 60s Cinematic Explainer for Soroban-rs',
  mode: 'proposal' as 'proposal' | 'open',
  reward: 1200
};

export default function SubmitQuestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const quest = MOCK_QUEST;

  if (isSubmitted) {
    return (
      <RootContainer>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
           <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 animate-in zoom-in duration-500">
              <CheckCircle2 size={48} />
           </div>
           <div className="space-y-2">
             <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Success!</h1>
             <p className="text-muted-foreground font-medium max-w-md">
                Your {quest.mode === 'proposal' ? 'proposal' : 'submission'} has been recorded. 
                The project owner will be notified immediately.
             </p>
           </div>
           <Link href="/timeline" className="px-8 py-4 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 flex items-center gap-2 hover:-translate-y-1 transition-all">
              VIEW IN MY TASKS
              <ArrowRight size={18} />
           </Link>
        </div>
      </RootContainer>
    );
  }

  return (
    <RootContainer>
      <div className="flex-1 bg-surface-low overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 md:p-12 lg:p-16">
          <Link href={`/quest/${quest.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-tight">Back to Quest</span>
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-xs mb-3">
              {quest.mode === 'open' ? <Zap size={16} /> : <UserCheck size={16} />}
              {quest.mode === 'open' ? 'Direct Submission' : 'Pitch a Proposal'}
            </div>
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-2">{quest.title}</h1>
            <p className="text-muted-foreground font-medium">Quest Prize: <span className="text-accent font-bold">{quest.reward} Pts</span></p>
          </header>

          <div className="bg-surface-mid border border-border-subtle rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl shadow-accent/5">
             {quest.mode === 'proposal' ? (
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-xs font-black text-foreground uppercase tracking-widest block">Your Pitch</label>
                     <textarea 
                        placeholder="Why are you the best fit? Mention your stack, past projects, and initial thoughts on this quest..." 
                        rows={6}
                        className="w-full bg-surface-high border border-border-subtle rounded-2xl p-6 text-foreground focus:outline-none focus:border-accent/40 font-medium placeholder:opacity-30 resize-none transition-all"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <label className="text-xs font-black text-foreground uppercase tracking-widest block">Delivery Est.</label>
                        <select className="w-full bg-surface-high border border-border-subtle rounded-2xl p-4 text-foreground focus:outline-none font-bold appearance-none">
                           <option>24 Hours</option>
                           <option>3 Days</option>
                           <option>1 Week</option>
                           <option>Custom</option>
                        </select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-xs font-black text-foreground uppercase tracking-widest block">Portfolio Link</label>
                        <input 
                           type="text" 
                           placeholder="github.com/yourhandle" 
                           className="w-full bg-surface-high border border-border-subtle rounded-2xl p-4 text-foreground focus:outline-none placeholder:opacity-30 font-medium"
                        />
                     </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-xs font-black text-foreground uppercase tracking-widest block">Proof of Work (URL)</label>
                     <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
                        <input 
                           type="text" 
                           placeholder="https://vimeo.com/... or https://github.com/..." 
                           className="w-full bg-surface-high border border-border-subtle rounded-2xl py-5 pl-12 pr-6 text-foreground focus:outline-none focus:border-accent/40 font-bold placeholder:opacity-30"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-black text-foreground uppercase tracking-widest block">Description / Notes</label>
                     <textarea 
                        placeholder="Any specific details the owner should know about your solution..." 
                        rows={4}
                        className="w-full bg-surface-high border border-border-subtle rounded-2xl p-6 text-foreground focus:outline-none focus:border-accent/40 font-medium placeholder:opacity-30 resize-none"
                     />
                  </div>

                  <div className="flex gap-4">
                     <button className="flex-1 py-4 border-2 border-dashed border-border-subtle hover:border-accent/40 rounded-2xl text-muted-foreground hover:text-foreground transition-all flex flex-col items-center justify-center gap-2 group">
                        <FileUp size={24} className="group-hover:text-accent transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Attach Files (Max 50MB)</span>
                     </button>
                  </div>
               </div>
             )}

             <div className="pt-8 border-t border-border-subtle flex flex-col gap-4">
                <button 
                  onClick={() => setIsSubmitted(true)}
                  className="w-full py-5 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black transition-all shadow-2xl shadow-accent/40 tracking-tight flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                   <Send size={20} fill="currentColor" className="-rotate-45 mb-1" />
                   {quest.mode === 'proposal' ? 'SHIP PROPOSAL' : 'SUBMIT WORK'}
                </button>
                <div className="flex items-start gap-2 bg-black/5 p-4 rounded-2xl border border-border-subtle text-[10px] text-muted-foreground italic leading-relaxed">
                   <AlertCircle size={14} className="shrink-0 text-accent opacity-70" />
                   Submitting work implies you agree to the project's license and terms. Rewards are distributed automatically upon approval.
                </div>
             </div>
          </div>
        </div>
      </div>
    </RootContainer>
  );
}
