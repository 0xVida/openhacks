'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, SortAsc, ArrowLeft, Plus, Code2, ExternalLink, Shield, Loader2 } from 'lucide-react';
import IssueCard, { Issue } from '@/components/ui/IssueCard';
import IssueDetail from '@/components/ui/IssueDetail';
import { useRole } from '@/components/providers/role-context';
import Github from '@/components/ui/GithubIcon';

const MOCK_ISSUES: Issue[] = [
  {
    id: '750',
    title: 'repl/executor: call_function storage diff always uses an empty filter list',
    description: 'The StorageInspector::compute_diff function currently passes an empty key-filter slice.',
    repo: 'soroban-debugger',
    author: 'IfeDev1',
    points: 200,
    reward: 200,
    status: 'closed',
    labels: ['Rust', 'Debugger']
  },
  {
    id: '742',
    title: 'error_db: unknown error codes print to stdout instead of logging',
    description: 'Error database is failing to log unknown error codes correctly.',
    repo: 'soroban-debugger',
    author: 'IfeDev1',
    points: 150,
    reward: 150,
    status: 'closed',
    labels: ['Bug', 'Refactor']
  },
  {
    id: '414',
    title: 'Bet Confirmation Modal with Pre-Submit Summary',
    description: 'Add a summary view to the bet confirmation modal.',
    repo: 'stellar-polymarket',
    author: 'Hahfyeex',
    points: 200,
    reward: 200,
    status: 'closed',
    labels: ['UI/UX', 'React']
  }
];

const MOCK_MAINTAINER_BOUNTIES: Issue[] = [
  {
    id: '101',
    title: 'Optimizing data structures for scale',
    description: 'Refactor the core data structures to handle millions of entries.',
    repo: 'openhacks-core',
    author: 'Admin',
    points: 1000,
    reward: 1000,
    status: 'open',
    labels: ['Critical', 'Backend']
  },
  {
    id: '102',
    title: 'Implement Dark Mode transition micro-animations',
    description: 'Add smooth CSS transitions for theme switching.',
    repo: 'openhacks-ui',
    author: 'Admin',
    points: 300,
    reward: 300,
    status: 'open',
    labels: ['UI', 'Animation']
  }
];

export default function Home() {
  const { role, registeredRepos } = useRole();
  const [bounties, setBounties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  React.useEffect(() => {
    async function fetchBounties() {
      try {
        const response = await fetch('/api/bounties');
        const result = await response.json();
        if (result.success) {
          const transformed = result.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            description: b.description,
            repo: b.repo_fullname.split('/')[1] || b.repo_fullname,
            repoFullName: b.repo_fullname,
            issueNumber: b.issue_number,
            author: b.repo_fullname.split('/')[0],
            points: b.reward_amount,
            reward: b.reward_amount,
            status: b.status,
            labels: ['GitHub Issue']
          }));

          // Filter logic: In Maintainer mode, maybe you only want to see your own?
          // Actually, per user request, "shows on contributor side too", so the list is unified but UI adapts.
          const filtered = role === 'maintainer' 
            ? transformed.filter((b: any) => registeredRepos.includes(b.repoFullName))
            : transformed;

          setBounties(filtered);
          if (filtered.length > 0) {
            setSelectedIssue(filtered[0]);
          } else {
            setSelectedIssue(null);
          }
        }
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBounties();
  }, [role, registeredRepos]);

  const handleSelectIssue = (issue: any) => {
    setSelectedIssue(issue);
    setShowMobileDetail(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <div className={`
        ${showMobileDetail ? 'hidden lg:flex' : 'flex'} 
        w-full lg:w-[420px] flex-col border-r border-border-subtle bg-surface-low shrink-0 h-full transition-all duration-300
      `}>
        <div className="p-6 border-b border-border-subtle bg-surface-low sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              {role === 'contributor' ? 'Open Issues' : 'Active Bounties'}
            </h2>
            <div className="flex gap-2 text-muted-foreground">
              <button className="bg-surface-high p-2 rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {role === 'maintainer' && (
            <Link 
              href="/maintainer/create"
              className="w-full py-4 bg-accent text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-accent-hover transition-all group overflow-hidden relative shadow-xl shadow-accent/20"
            >
               <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
               <span className="text-xs font-black uppercase tracking-widest">Post New Bounty</span>
            </Link>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : bounties.map((issue) => (
            <div key={issue.id} onClick={() => handleSelectIssue(issue)}>
              <IssueCard issue={issue} active={selectedIssue?.id === issue.id} />
            </div>
          ))}

          {!isLoading && bounties.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              {role === 'maintainer' && registeredRepos.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                    <Github size={32} />
                  </div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">Connect Repository</h3>
                  <p className="text-xs text-muted-foreground font-medium mb-6 leading-relaxed">You haven't linked any projects yet. Connect a GitHub repository to start launching bounties.</p>
                  <Link 
                    href="/maintainer/setup" 
                    className="px-6 py-3 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Shield size={48} className="mb-4 text-muted-foreground opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">No active items</p>
                  {role === 'maintainer' && (
                    <p className="text-[10px] text-muted-foreground font-medium mt-2">Launch a new bounty to see it here.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right Pane - Detail View */}
      <div className={`
        ${showMobileDetail ? 'flex' : 'hidden lg:flex'} 
        flex-1 h-full overflow-hidden flex-col bg-surface-low
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-border-subtle bg-surface-low flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setShowMobileDetail(false)}
            className="p-2 hover:bg-surface-high rounded-full transition-colors text-foreground flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-black uppercase tracking-tight">Back</span>
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                <Code2 size={16} />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-foreground truncate max-w-[120px]">
                {selectedIssue?.repo || 'Loading...'}
             </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
           {selectedIssue ? (
             <IssueDetail issue={selectedIssue} />
           ) : (
        <div className="h-full flex flex-col items-center justify-center bg-surface-low opacity-30">
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <Loader2 className="animate-spin text-accent mb-6" size={48} />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground/50">Awaiting Selection</p>
            <div className="w-12 h-0.5 bg-accent/20 mt-4 rounded-full" />
          </div>
        </div>
           )}
        </div>
      </div>
    </div>
  );
}
