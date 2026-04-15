'use client';

import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
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
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Maintainer</p>
                <p className="text-sm font-black text-foreground tracking-tight">{issue.author || 'Project Owner'}</p>
             </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Reward</p>
            <p className="text-sm font-black text-accent tracking-tight">{issue.reward} USDC</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-muted-foreground shrink-0 opacity-50">#{issue.issueNumber}</h2>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight">{issue.title}</h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 mb-10 pb-10 border-b border-border-subtle">
          <a 
            href={`https://github.com/${issue.repoFullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-high border border-border-subtle hover:border-accent/40 transition-colors cursor-pointer group no-underline"
          >
            <Building2 size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
            <span className="text-sm font-semibold text-foreground/90">{issue.repoFullName || issue.repo}</span>
            <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
             <Clock size={16} />
             <span>Status: {issue.status.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="space-y-8 text-foreground/90 max-w-4xl leading-relaxed">
          <article className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
            <div className="text-base md:text-lg font-medium leading-relaxed markdown-content">
              {issue.description ? (
                <ReactMarkdown>{issue.description}</ReactMarkdown>
              ) : (
                "No detailed description provided for this bounty."
              )}
            </div>
          </article>
          
          <div className="bg-accent/5 border-l-4 border-accent p-6 rounded-r-3xl shadow-sm">
             <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                <Zap size={14} />
                Bounty Instructions
             </div>
             <p className="text-sm md:text-base font-medium text-foreground">
                To claim this bounty, please submit a pull request on GitHub referencing this issue. Once the maintainer merges your PR, the payment will be automatically triggered.
             </p>
          </div>

          {/* Mobile/In-line funding action */}
          {role === 'maintainer' && issue.status === 'pending' && issue.locus_checkout_url && (
            <div className="md:hidden mt-8 p-6 bg-surface-mid rounded-3xl border-2 border-accent/20 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-accent mb-2">
                <Award size={24} />
                <span className="text-sm font-black uppercase tracking-widest">Unfunded Bounty</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium mb-2">
                 Complete the escrow payment to activate this bounty for the community.
              </p>
              <a 
                href={issue.locus_checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 bg-accent text-white rounded-2xl font-black transition-all shadow-xl shadow-accent/20 tracking-tight flex items-center justify-center gap-3 group active:scale-95 text-center no-underline"
              >
                 <Zap size={18} className="fill-current" />
                 COMPLETE ESCROW
              </a>
            </div>
          )}
        </div>
      </div>
      

      <div className="hidden md:flex w-80 border-l border-border-subtle bg-surface-low p-8 shrink-0 flex-col gap-10">
        <div className="space-y-10">
           <div className="group text-center">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-6">Bounty Value</h4>
              <div className="bg-surface-mid p-8 rounded-[2.5rem] border-2 border-accent/20 flex flex-col items-center justify-center gap-2 group-hover:border-accent/40 transition-all shadow-xl shadow-accent/5">
                 <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-2">
                    <Award size={32} />
                 </div>
                 <span className="text-3xl font-black text-foreground">{issue.reward}</span>
                 <span className="text-[10px] font-black text-accent uppercase tracking-widest">USDC</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-6 pt-6 border-t border-border-subtle">
              <DetailRow icon={<Clock size={16} />} label="Issue Status" value={issue.status.toUpperCase()} />
              <DetailRow icon={<Zap size={16} />} label="Type" value="GitHub Issue" color="text-accent" />
           </div>

           <div className="pt-8 border-t border-border-subtle">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-4">Project Authority</h4>
              <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl border border-border-subtle hover:shadow-md transition-all">
                 <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Building2 size={20} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <span className="text-xs font-black text-foreground block tracking-tight truncate uppercase">{issue.repoFullName?.split('/')[0] || 'Unknown'}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Verified Owner</span>
                 </div>
              </div>
           </div>
        </div>

        {role === 'contributor' && (
          <a 
            href={`https://github.com/${issue.repoFullName}/issues/${issue.issueNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-5 bg-foreground text-background hover:bg-accent hover:text-white rounded-2xl font-black transition-all shadow-xl shadow-black/10 tracking-tight flex items-center justify-center gap-3 group active:scale-95 text-center no-underline"
          >
             <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
             VIEW ON GITHUB
          </a>
        )}

        {role === 'maintainer' && issue.status === 'pending' && issue.locus_checkout_url && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
               <p className="text-[10px] font-black uppercase text-amber-600 mb-2">Unfunded Bounty</p>
               <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  This bounty is initialized but not yet funded. Complete the escrow payment to make it active for contributors.
               </p>
            </div>
            <a 
              href={issue.locus_checkout_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 bg-accent text-white hover:bg-accent-hover rounded-2xl font-black transition-all shadow-xl shadow-accent/20 tracking-tight flex items-center justify-center gap-3 group active:scale-95 text-center no-underline"
            >
               <Zap size={18} className="fill-current" />
               COMPLETE ESCROW
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const DetailRow = ({ icon, label, value, color = "text-foreground" }: { icon: React.ReactNode, label: string, value: string, color?: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-muted-foreground">
       {icon}
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-sm font-black tracking-tight ${color}`}>{value}</span>
  </div>
);
