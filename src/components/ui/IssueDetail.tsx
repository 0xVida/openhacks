'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  ExternalLink, 
  Clock, 
  ChevronRight, 
  FileCode, 
  Zap, 
  Award,
  Building2,
  CheckCircle2,
  History
} from 'lucide-react';
import { useRole } from '@/components/providers/role-context';
import { Issue } from './IssueCard';

interface IssueDetailProps {
  issue: Issue;
}

export default function IssueDetail({ issue }: IssueDetailProps) {
  const { role } = useRole();
  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-surface-low border-l border-border-subtle overflow-hidden relative">

      <div className="md:hidden flex items-center justify-between p-4 bg-surface-mid/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-20">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                <User size={20} className="text-accent" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Assigned to</p>
                <p className="text-sm font-black text-foreground tracking-tight">Degenerate Alchemist</p>
             </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Reward</p>
            <p className="text-sm font-black text-accent tracking-tight">{issue.points} Pts</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-2">
             <History size={14} />
             <span>Opened March 28, 2026</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-muted-foreground shrink-0 opacity-50">#{issue.id}</h2>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight">{issue.title}</h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 mb-10 pb-10 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-high border border-border-subtle hover:border-accent/40 transition-colors cursor-pointer group">
            <Building2 size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
            <span className="text-sm font-semibold text-foreground/90">{issue.author} / {issue.repo}</span>
            <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
             <Clock size={16} />
             <span>Deadline: Mar 30</span>
          </div>
        </div>
        
        <div className="space-y-8 text-foreground/90 max-w-4xl leading-relaxed">
          <div className="bg-surface-mid border border-border-subtle rounded-2xl p-5 md:p-6 group relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-4">
               <FileCode size={14} />
               Problem Location
            </div>
            <code className="text-xs md:text-sm font-mono block break-all text-foreground/80 bg-black/10 dark:bg-white/10 p-3 rounded-xl italic">
               src/repl/executor.rs — ReplExecutor::call_function
            </code>
          </div>
          
          <article className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
            <p className="text-base md:text-lg">
              The <code className="bg-accent/10 px-1.5 py-0.5 rounded text-accent font-semibold italic">StorageInspector::compute_diff</code> function currently passes an empty key-filter slice. 
            </p>
            <p>
               This causes every storage entry to be shown in the diff even for contracts with large ledger state. For token contracts with many balance entries, this produces extremely noisy output that makes the debugging process cumbersome for developers.
            </p>
          </article>
          
          <div className="bg-accent/5 border-l-4 border-accent p-6 rounded-r-3xl shadow-sm">
             <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                <Zap size={14} />
                Proposed Solution
             </div>
             <p className="text-sm md:text-base font-medium text-foreground">
                Allow the user to pass a <code className="bg-accent/10 px-1.5 py-0.5 rounded font-mono text-xs">--watch-keys</code> flag or provide a per-session filter list to focus on specific state changes that matter for the current debugging context.
             </p>
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-border-subtle">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                <History size={22} className="text-accent" />
                Applications
             </h3>
             {role === 'contributor' && (
               <a href={`/apply/${issue.id}`} className="md:hidden px-6 py-2 bg-accent text-white rounded-full font-bold text-sm shadow-lg shadow-accent/20">
                  Apply
               </a>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <ApplicantCard 
                issueId={issue.id}
                appId="1"
                name="Charles Chinedum" 
                time="2h ago" 
                type="verified" 
                score={98}
                pitch="Experienced Rust dev with 5+ years in systems programming. I built the initial storage layer for..."
                tags={['Rust expert', 'Reliable']}
             />
             <ApplicantCard 
                issueId={issue.id}
                appId="2"
                name="Stellar Dev" 
                time="5h ago" 
                type="new" 
                score={85}
                pitch="I've worked on similar Soroban debugging tools before. Can deliver a fix within 48 hours."
                tags={['Soroban', 'Fast']}
             />
             <ApplicantCard 
                issueId={issue.id}
                appId="3"
                name="Rust Wizard" 
                time="12h ago" 
                type="verified" 
                score={92}
                pitch="Systems engineer focused on performance. I can optimize the compute_diff logic while I'm at it."
                tags={['Perf king', 'Safe']}
             />
          </div>
        </div>
      </div>
      

      <div className="hidden md:flex w-80 border-l border-border-subtle bg-surface-low p-8 shrink-0 flex-col gap-10">
        {role === 'contributor' && (
          <a href={`/apply/${issue.id}`} className="w-full py-4 bg-accent hover:bg-accent-hover text-center text-white rounded-2xl font-black transition-all shadow-xl shadow-accent/30 tracking-tight transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
             <Zap size={18} fill="currentColor" />
             APPLY TO WORK
          </a>
        )}
        
        <div className="space-y-10">
           <div className="group">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-4">Assigned Applicant</h4>
              <div className="flex items-center gap-4 bg-surface-mid p-4 rounded-2xl border border-border-subtle group-hover:border-accent/40 transition-all cursor-pointer">
                 <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/20 overflow-hidden flex items-center justify-center text-purple-500">
                    <User size={20} />
                 </div>
                 <span className="text-sm font-bold text-foreground truncate uppercase tracking-tight">Degenerate Alchemist</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-6 pt-6 border-t border-border-subtle">
              <DetailRow icon={<Clock size={16} />} label="Due Date" value="Mar 30, 2026" />
              <DetailRow icon={<Award size={16} />} label="Reward" value={`${issue.points} Points`} />
              <DetailRow icon={<Zap size={16} />} label="Complexity" value="High" color="text-orange-500" />
           </div>

           <div className="pt-8 border-t border-border-subtle">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-4 group-hover:text-accent transition-colors">Program Details</h4>
              <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl border border-border-subtle hover:shadow-md transition-all">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Building2 size={16} />
                 </div>
                 <div>
                    <span className="text-xs font-black text-foreground block tracking-tight">STELLAR WAVE</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Q1 Cohort</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const ApplicantCard = ({ issueId, appId, name, time, type, score, pitch, tags }: { 
  issueId: string, 
  appId: string,
  name: string, 
  time: string, 
  type: 'verified' | 'new',
  score: number,
  pitch: string,
  tags: string[]
}) => (
  <Link href={`/issue/${issueId}/application/${appId}`} className="group block">
    <div className="bg-surface-mid border border-border-subtle rounded-2xl p-6 flex flex-col gap-4 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all cursor-pointer transform hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Match</span>
          <span className="text-xl font-black text-accent leading-none">{score}%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-14 h-14 rounded-full bg-surface-high border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-accent transition-all ring-0 group-hover:ring-4 ring-accent/5 overflow-hidden">
            <User size={24} />
         </div>
         <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-foreground group-hover:text-accent transition-colors text-base uppercase tracking-tight">{name}</h4>
              {type === 'verified' && <CheckCircle2 size={14} className="text-green-500" />}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{time}</p>
         </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed italic">
          "{pitch}"
        </p>
        
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-surface-high border border-border-subtle text-muted-foreground rounded-lg group-hover:border-accent/20 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[10px] font-black text-accent uppercase tracking-widest">View Full Proposal</span>
        <ChevronRight size={16} className="text-accent group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

const DetailRow = ({ icon, label, value, color = "text-foreground" }: { icon: React.ReactNode, label: string, value: string, color?: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-muted-foreground">
       {icon}
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-sm font-black tracking-tight ${color}`}>{value}</span>
  </div>
);
