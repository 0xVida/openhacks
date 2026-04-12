'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Inbox, 
  Zap, 
  UserCheck, 
  ArrowRight, 
  Trophy, 
  MoreHorizontal,
  ChevronRight,
  Filter,
  User,
  History,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useRole } from '@/components/providers/role-context';
import RootContainer from '@/components/layout/RootContainer';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  project: string;
  reward: number;
  status: 'active' | 'review' | 'pending' | 'completed';
  type: 'open' | 'proposal';
  deadline: string;
  lastUpdated: string;
}

interface Submission {
  id: string;
  user: string;
  questTitle: string;
  score: number;
  time: string;
  status: 'new' | 'viewed';
  type: 'work' | 'proposal';
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: '60s Cinematic Explainer', project: 'Stellar Foundation', reward: 1200, status: 'pending', type: 'proposal', deadline: 'Apr 10', lastUpdated: '2h ago' },
  { id: '2', title: 'Storage Layer Optimization', project: 'Indexer-Node', reward: 2500, status: 'active', type: 'proposal', deadline: 'Apr 15', lastUpdated: '5h ago' },
  { id: '3', title: 'Fixed ReplExecutor bug', project: 'OpenBags', reward: 400, status: 'review', type: 'open', deadline: 'Passed', lastUpdated: '12h ago' },
];

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's1', user: 'Charles Chinedum', questTitle: 'Stellar UI Icons', score: 98, time: '30m ago', status: 'new', type: 'work' },
  { id: 's2', user: 'Stellar Dev', questTitle: 'Cinematic Explainer', score: 85, time: '2h ago', status: 'new', type: 'proposal' },
  { id: 's3', user: 'Rust Wizard', questTitle: 'Storage Optimization', score: 92, time: '1d ago', status: 'viewed', type: 'proposal' },
];

export default function TimelinePage() {
  const { role } = useRole();

  return (
    <RootContainer>
      <div className="flex-1 bg-surface-low overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-12 lg:p-16">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-xs mb-3">
                <History size={16} />
                Activity Center
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">
                {role === 'contributor' ? 'My Tasks' : 'Submissions Inbox'}
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                {role === 'contributor' 
                  ? 'Track your active assignments, pending applications, and history.' 
                  : 'Manage your bounty submissions, review proposals, and hire talent.'}
              </p>
            </div>

            <div className="flex bg-surface-mid p-1.5 rounded-2xl border border-border-subtle shadow-sm">
               <button className="px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20">Active</button>
               <button className="px-5 py-2.5 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors">History</button>
            </div>
          </header>

          {role === 'contributor' ? (
            <div className="space-y-6">
               {MOCK_TASKS.map(task => (
                 <ContributorTaskCard key={task.id} task={task} />
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {MOCK_SUBMISSIONS.map(sub => (
                 <MaintainerSubmissionCard key={sub.id} sub={sub} />
               ))}
            </div>
          )}
        </div>
      </div>
    </RootContainer>
  );
}

const ContributorTaskCard = ({ task }: { task: Task }) => {
  const statusStyles = {
    active: 'bg-green-500 text-white',
    review: 'bg-blue-500 text-white',
    pending: 'bg-orange-500 text-white',
    completed: 'bg-accent text-white'
  };

  return (
    <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 transition-all">
       <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-high border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-accent transition-all">
             {task.type === 'open' ? <Zap size={24} /> : <UserCheck size={24} />}
          </div>
          <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{task.project}</span>
                <span className="w-1 h-1 rounded-full bg-border-subtle" />
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{task.reward} Pts</span>
             </div>
             <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-tight">{task.title}</h3>
             <div className="flex items-center gap-4 mt-3">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStyles[task.status]}`}>
                   {task.status === 'review' ? 'In Review' : task.status}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground italic">
                   <Clock size={12} />
                   Updated {task.lastUpdated}
                </div>
             </div>
          </div>
       </div>

       <div className="flex items-center gap-3">
          <Link href="/timeline" className="flex-1 md:flex-none px-6 py-3 bg-surface-high border border-border-subtle hover:border-accent/40 rounded-xl text-xs font-black uppercase tracking-widest text-foreground transition-all flex items-center justify-center gap-2">
             <MessageSquare size={14} className="text-accent" />
             Chat
          </Link>
          <button className="p-3 bg-surface-high border border-border-subtle hover:border-accent/40 rounded-xl transition-all">
             <MoreHorizontal size={16} />
          </button>
       </div>
    </div>
  );
};

const MaintainerSubmissionCard = ({ sub }: { sub: Submission }) => (
  <div className="bg-surface-mid border border-border-subtle rounded-[2.5rem] p-8 flex flex-col gap-6 relative group hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all cursor-pointer overflow-hidden">
     {sub.status === 'new' && (
       <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-glow shadow-accent" />
       </div>
     )}

     <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-high border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-accent transition-all ring-0 group-hover:ring-4 ring-accent/5">
           <User size={24} />
        </div>
        <div>
           <h4 className="font-black text-foreground uppercase tracking-tight">{sub.user}</h4>
           <div className="flex items-center gap-2">
              <span className="text-[10px] text-accent font-black uppercase tracking-widest">{sub.score}% Match</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{sub.time}</span>
           </div>
        </div>
     </div>

     <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Applying for:</p>
        <h3 className="text-lg font-black text-foreground group-hover:text-accent transition-all uppercase tracking-tight leading-none mb-3">
           {sub.questTitle}
        </h3>
        <div className="px-3 py-1.5 bg-surface-high rounded-xl border border-border-subtle w-fit text-[9px] font-black uppercase tracking-widest text-muted-foreground">
           {sub.type === 'work' ? 'Direct Submission' : 'Pitch Proposal'}
        </div>
     </div>

     <div className="pt-6 border-t border-border-subtle flex items-center gap-3">
        <button className="flex-1 py-3 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-105 transition-all">
           Hire & Approve
        </button>
        <button className="p-3 bg-surface-high border border-border-subtle hover:border-red-500/40 rounded-xl transition-all">
           <AlertCircle size={14} className="text-muted-foreground group-hover:text-red-500 transition-colors" />
        </button>
     </div>
  </div>
);
