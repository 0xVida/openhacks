'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Video, 
  Code2, 
  Palette, 
  Zap, 
  UserCheck, 
  Trophy,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useRole } from '@/components/providers/role-context';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  category: 'code' | 'creative' | 'design';
  reward: number;
  mode: 'open' | 'proposal';
  project: string;
  time: string;
}

const MOCK_QUESTS: Quest[] = [
  { id: 'q1', title: 'Create a 60s Cinematic Explainer for Soroban-rs', category: 'creative', reward: 1200, mode: 'proposal', project: 'Stellar Foundation', time: '2d left' },
  { id: 'q2', title: 'Design a sleek Dark Mode icon set for OpenBags', category: 'design', reward: 800, mode: 'open', project: 'OpenBags', time: '4h left' },
  { id: 'q3', title: 'Optimizing high-concurrency storage layer in Go', category: 'code', reward: 2500, mode: 'proposal', project: 'Indexer-Node', time: '5d left' },
  { id: 'q4', title: 'Write an deep-dive article on Soroban smart contract security', category: 'creative', reward: 500, mode: 'open', project: 'Stellar University', time: '12h left' },
];

export default function QuestsPage() {
  const { role } = useRole();

  return (
    <div className="flex-1 bg-surface-low overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-xs mb-3">
                 <Sparkles size={16} />
                 Special Bounties
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">Quest Explorer</h1>
              <p className="text-muted-foreground mt-2 font-medium">Discover creative and technical challenges with massive rewards.</p>
           </div>
           
           {role === 'maintainer' ? (
             <Link href="/maintainer/create" className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-black transition-all shadow-xl shadow-accent/30 tracking-tight flex items-center justify-center gap-2 group active:scale-95">
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                POST NEW BOUNTY
             </Link>
           ) : (
             <div className="flex bg-surface-mid p-1.5 rounded-2xl border border-border-subtle shadow-sm">
                <button className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20">All Quests</button>
                <button className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors">Popular</button>
                <button className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors">Expiring</button>
             </div>
           )}
        </header>

        <div className="relative group mb-10 w-full max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by keywords, tags, or projects..." 
            className="w-full bg-surface-mid border border-border-subtle rounded-3xl py-5 pl-16 pr-6 text-foreground focus:outline-none focus:border-accent/50 focus:bg-surface-low transition-all shadow-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {MOCK_QUESTS.map(quest => (
             <QuestCard key={quest.id} quest={quest} />
           ))}
        </div>
      </div>
    </div>
  );
}

const QuestCard = ({ quest }: { quest: Quest }) => {
  const IconMap = {
    code: <Code2 size={32} />,
    creative: <Video size={32} />,
    design: <Palette size={32} />
  };

  return (
    <div className="group bg-surface-mid border border-border-subtle rounded-[2.5rem] p-8 flex flex-col gap-6 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all cursor-pointer relative overflow-hidden transform hover:-translate-y-1">
      <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest">
            <Trophy size={11} />
            {quest.reward} Pts
         </div>
         <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] ${quest.mode === 'open' ? 'text-green-500' : 'text-orange-500'}`}>
            {quest.mode === 'open' ? <Zap size={10} /> : <UserCheck size={10} />}
            {quest.mode === 'open' ? 'OPEN ENTRY' : 'PROPOSAL BASED'}
         </div>
      </div>

      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all ring-0 group-hover:ring-8 ring-accent/5 bg-surface-high text-muted-foreground group-hover:text-accent border border-border-subtle`}>
         {IconMap[quest.category]}
      </div>

      <div className="space-y-4">
         <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{quest.project}</p>
            <h3 className="text-xl font-black text-foreground group-hover:text-accent transition-colors leading-tight uppercase tracking-tight">
               {quest.title}
            </h3>
         </div>
         
         <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
            <span className="text-xs font-bold text-muted-foreground italic flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-accent" />
               {quest.time}
            </span>
            <div className="flex items-center gap-2 text-xs font-black text-accent uppercase tracking-widest group-hover:gap-3 transition-all">
               View Details
               <ArrowRight size={16} />
            </div>
         </div>
      </div>
    </div>
  );
};
