'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Zap, 
  UserCheck, 
  Share2, 
  ShieldCheck,
  Video,
  Code2,
  Palette,
  ExternalLink,
  ChevronRight,
  User,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRole } from '@/components/providers/role-context';
import RootContainer from '@/components/layout/RootContainer';

const MOCK_QUEST = {
  id: 'q1',
  title: 'Create a 60s Cinematic Explainer for Soroban-rs',
  category: 'creative' as 'creative' | 'code' | 'design',
  reward: 1200,
  mode: 'proposal' as 'proposal' | 'open',
  project: 'Stellar Foundation',
  time: '2d left',
  description: `We need a high-quality cinematic explainer video for the Soroban Rust SDK. 
  The video should highlight the ease of use, safety features, and the incredible performance of Soroban. 
  Target audience: Developers who are new to Stellar but experienced in Rust.`,
  requirements: [
    'Resolution: 4K (3840x2160)',
    'Duration: 45s - 90s',
    'Voiceover: Professional and clear',
    'Subtitles: Required in English'
  ],
  applicants: [
    { name: 'VideoPro', rating: 4.8, count: 12 },
    { name: 'MotionGenius', rating: 5.0, count: 5 }
  ]
};

export default function QuestDetailPage() {
  const { role } = useRole();
  const quest = MOCK_QUEST;

  const IconMap = {
    code: <Code2 size={40} />,
    creative: <Video size={40} />,
    design: <Palette size={40} />
  };

  return (
    <RootContainer>
      <div className="flex-1 bg-surface-low overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-12 lg:p-16">
          <Link href="/quests" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-tight">Back to Explorer</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-12">
              <header>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-surface-mid border border-border-subtle flex items-center justify-center text-accent shadow-xl shadow-accent/5">
                       {IconMap[quest.category]}
                    </div>
                    <div>
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1 border-b border-accent/20 w-fit pb-1">
                          {quest.project}
                       </div>
                       <h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
                          {quest.title}
                       </h1>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 bg-surface-mid border border-border-subtle rounded-2xl flex items-center gap-2">
                       <Clock size={16} className="text-muted-foreground" />
                       <span className="text-sm font-bold text-foreground">{quest.time}</span>
                    </div>
                    <div className={`px-4 py-2 border rounded-2xl flex items-center gap-2 ${
                       quest.mode === 'open' 
                        ? 'bg-green-500/5 border-green-500/20 text-green-500' 
                        : 'bg-orange-500/5 border-orange-500/20 text-orange-500'
                    }`}>
                       {quest.mode === 'open' ? <Zap size={16} /> : <UserCheck size={16} />}
                       <span className="text-sm font-black uppercase tracking-widest">{quest.mode === 'open' ? 'Open Entry' : 'Proposal Based'}</span>
                    </div>
                 </div>
              </header>

              <div className="prose prose-invert max-w-none">
                 <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-3">
                    <ShieldCheck size={24} className="text-accent" />
                    Quest Brief
                 </h3>
                 <p className="text-lg text-muted-foreground leading-relaxed leading-8">
                    {quest.description}
                 </p>

                 <h3 className="text-xl font-black text-foreground uppercase tracking-tight mt-12 mb-6">Requirements</h3>
                 <ul className="space-y-4 list-none p-0">
                    {quest.requirements.map(req => (
                      <li key={req} className="flex items-center gap-4 bg-surface-mid p-5 rounded-2xl border border-border-subtle hover:border-accent/30 transition-colors">
                         <div className="w-2 h-2 rounded-full bg-accent shadow-glow shadow-accent/50" />
                         <span className="font-bold text-foreground">{req}</span>
                      </li>
                    ))}
                 </ul>
              </div>
            </div>

            <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-8 self-start space-y-6">
                <div className="bg-surface-mid border border-border-subtle rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-accent/5 overflow-hidden relative group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-[80px] rounded-full group-hover:bg-accent/20 transition-all duration-700" />
                  
                  <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Quest Reward</p>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-xl shadow-accent/40">
                          <Trophy size={28} />
                       </div>
                       <div>
                          <p className="text-4xl font-black text-foreground flex items-center gap-1">
                             {quest.reward.toLocaleString()}
                             <span className="text-sm text-accent opacity-50 ml-1">Pts</span>
                          </p>
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Verified Multiplier Active</p>
                       </div>
                    </div>
                  </div>

                  {role === 'contributor' ? (
                    <div className="space-y-4 relative">
                       <Link 
                         href={`/quest/${quest.id}/apply`}
                         className="w-full py-5 bg-accent hover:bg-accent-hover text-white rounded-[2rem] font-black transition-all shadow-2xl shadow-accent/30 tracking-tight flex items-center justify-center gap-3 active:scale-95 group/btn"
                       >
                          {quest.mode === 'open' ? <Zap size={22} fill="currentColor" /> : <UserCheck size={22} />}
                          {quest.mode === 'open' ? 'SUBMIT SOLUTION' : 'SUBMIT PROPOSAL'}
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                       <p className="text-center text-[10px] text-muted-foreground font-medium italic">
                          {quest.mode === 'open' 
                            ? "This is an open quest. Submit your work directly!" 
                            : "Submit a proposal to be selected for this task."}
                       </p>
                    </div>
                  ) : (
                    <div className="bg-surface-high/50 border border-border-subtle rounded-3xl p-6 relative">
                       <div className="flex items-center gap-3 text-orange-500 mb-2">
                          <AlertCircle size={18} />
                          <span className="text-xs font-black uppercase tracking-widest leading-none">Admin View</span>
                       </div>
                       <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                          As a project owner, you can manage submissions and review proposals from the <Link href="/timeline" className="text-accent underline font-bold">Inbox</Link>.
                       </p>
                    </div>
                  )}

                  <div className="pt-8 border-t border-border-subtle space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Social Engagement</span>
                       <button className="p-2 hover:bg-surface-high rounded-xl transition-colors">
                          <Share2 size={16} className="text-accent" />
                       </button>
                    </div>
                    <div className="flex -space-x-4">
                       {[...Array(6)].map((_, i) => (
                         <div key={i} className="w-10 h-10 rounded-full border-4 border-surface-mid bg-surface-high overflow-hidden flex items-center justify-center text-muted-foreground">
                            <User size={16} />
                         </div>
                       ))}
                       <div className="w-10 h-10 rounded-full border-4 border-surface-mid bg-accent text-white flex items-center justify-center text-[10px] font-black">
                          +12
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </RootContainer>
  );
}

const ArrowRight = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
