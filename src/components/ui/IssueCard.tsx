'use client';

import React from 'react';
import { EyeOff, User, Award } from 'lucide-react';

export interface Issue {
  id: string;
  title: string;
  description: string;
  repo: string;
  repoFullName: string;
  author: string;
  issueNumber: number;
  points: number;
  reward: number;
  status: 'closed' | 'open' | 'processing' | 'paid' | 'merged' | 'pending';
  labels: string[];
  maintainer_id?: string;
  locus_checkout_url?: string;
}

interface IssueCardProps {
  issue: Issue;
  active?: boolean;
}

export default function IssueCard({ issue, active }: IssueCardProps) {
  return (
    <div className={`p-4 transition-all cursor-pointer group ${active ? 'bg-surface-high ring-1 ring-accent/20' : 'hover:bg-surface-mid'} border-sleek`}>
        <div className="flex flex-wrap gap-2">
          {issue.status === 'pending' ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/20">
                 PENDING FUNDING
              </span>
              <a 
                href={issue.locus_checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] px-2 py-0.5 rounded bg-accent text-white font-black uppercase tracking-widest hover:bg-accent-hover transition-colors no-underline"
              >
                FUND NOW
              </a>
            </div>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${issue.status === 'closed' ? 'bg-muted-foreground/10 text-muted-foreground' : 'bg-accent/10 text-accent'} border border-current opacity-70`}>
              {issue.status}
            </span>
          )}
          {issue.status !== 'open' && issue.status !== 'pending' && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 font-bold flex items-center gap-1">
               <Award size={10} />
               Points earned
            </span>
          )}
        </div>
      
      <h3 className={`text-sm font-semibold mb-2 line-clamp-2 leading-snug ${active ? 'text-foreground' : 'text-foreground/80 dark:text-foreground/70 group-hover:text-foreground'}`}>
        <span className="text-muted-foreground mr-1 font-mono tracking-tighter">#{issue.issueNumber}</span>
        {issue.title}
      </h3>

      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {issue.labels.map(label => (
            <span 
              key={label}
              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-surface-high border border-border-subtle text-muted-foreground/70"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle/50">
        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-accent/20 shrink-0">
          <User size={12} className="text-accent" />
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[11px] font-medium text-muted-foreground truncate">{issue.author}</span>
          <span className="text-muted-foreground opacity-50">/</span>
          <span className="text-[11px] font-bold text-foreground/80 group-hover:text-foreground truncate">{issue.repo}</span>
        </div>
      </div>
    </div>
  );
}
