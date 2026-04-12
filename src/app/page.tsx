'use client';

import React, { useState } from 'react';
import { Filter, SortAsc, ArrowLeft, Plus, Code2, ExternalLink, Shield } from 'lucide-react';
import IssueCard, { Issue } from '@/components/ui/IssueCard';
import IssueDetail from '@/components/ui/IssueDetail';
import { useRole } from '@/components/providers/role-context';

const MOCK_ISSUES: Issue[] = [
  {
    id: '750',
    title: 'repl/executor: call_function storage diff always uses an empty filter list',
    repo: 'soroban-debugger',
    author: 'IfeDev1',
    points: 200,
    status: 'closed',
    labels: ['Rust', 'REPL']
  },
  {
    id: '742',
    title: 'error_db: unknown error codes print to stdout via display_error instead of logging',
    repo: 'soroban-debugger',
    author: 'IfeDev1',
    points: 150,
    status: 'closed',
    labels: ['Bug']
  },
  {
    id: '414',
    title: '[FE] #401 - Bet Confirmation Modal with Pre-Submit Summary',
    repo: 'Stellar-PolyMarket',
    author: 'Hahfyeex',
    points: 200,
    status: 'closed',
    labels: ['UI/UX']
  }
];

const MOCK_MAINTAINER_BOUNTIES: Issue[] = [
  {
    id: '101',
    title: 'Optimizing data structures for scale',
    repo: 'openbags-core',
    author: 'Admin',
    points: 1000,
    status: 'open',
    labels: ['Critical', 'Backend']
  },
  {
    id: '102',
    title: 'Implement Dark Mode transition micro-animations',
    repo: 'openbags-ui',
    author: 'Admin',
    points: 300,
    status: 'open',
    labels: ['Design', 'Animation']
  }
];

export default function Home() {
  const { role } = useRole();
  const issuesList = role === 'contributor' ? MOCK_ISSUES : MOCK_MAINTAINER_BOUNTIES;
  
  const [selectedIssue, setSelectedIssue] = useState<Issue>(issuesList[0]);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowMobileDetail(true);
  };

  // Switch selected issue when role changes if current choice is not in the new list
  React.useEffect(() => {
    setSelectedIssue(issuesList[0]);
  }, [role]);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Left Pane - List View */}
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
              <button className="bg-surface-high p-2 rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                <SortAsc size={18} />
              </button>
            </div>
          </div>

          {role === 'maintainer' && (
            <button className="w-full py-4 bg-surface-high border border-dashed border-border-subtle rounded-2xl flex items-center justify-center gap-3 text-muted-foreground hover:text-accent hover:border-accent/40 transition-all group overflow-hidden relative">
               <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
               <span className="text-xs font-black uppercase tracking-widest">Import from GitHub</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4 space-y-3">
          {issuesList.map((issue) => (
            <div key={issue.id} onClick={() => handleSelectIssue(issue)}>
              <IssueCard issue={issue} active={selectedIssue.id === issue.id} />
            </div>
          ))}

          {issuesList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-50">
               <Shield size={48} className="mb-4 text-muted-foreground" />
               <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No active items</p>
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
                {selectedIssue.repo}
             </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
           <IssueDetail issue={selectedIssue} />
        </div>
      </div>
    </div>
  );
}
