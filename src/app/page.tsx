'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, SortAsc, ArrowLeft, Plus, Code2, ExternalLink, Shield, Loader2 } from 'lucide-react';
import IssueCard, { Issue } from '@/components/ui/IssueCard';
import IssueDetail from '@/components/ui/IssueDetail';
import { useRole } from '@/components/providers/role-context';
import Github from '@/components/ui/GithubIcon';

export default function Home() {
  const { role, registeredRepos } = useRole();
  const [bounties, setBounties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // Load persistence
  React.useEffect(() => {
    const saved = localStorage.getItem('openhacks_sidebar_width');
    if (saved) {
      const width = parseInt(saved, 10);
      if (width > 280 && width < 600) {
        setSidebarWidth(width);
      }
    }
  }, []);

  const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = React.useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      localStorage.setItem('openhacks_sidebar_width', sidebarWidth.toString());
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, [isResizing, sidebarWidth]);

  const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > 260 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

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
            issue_number: b.issue_number,
            author: b.repo_fullname.split('/')[0],
            points: b.reward_amount,
            reward: b.reward_amount,
            status: b.status,
            maintainer_id: b.maintainer_id,
            labels: ['GitHub Issue']
          }));

          const filtered = role === 'maintainer' 
            ? transformed.filter((b: any) => 
                registeredRepos.includes(b.repoFullName) || 
                (githubUser?.id && b.maintainer_id === githubUser.id)
              )
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
    <div className="flex flex-1 h-full overflow-hidden relative">
      <div 
        style={{ width: showMobileDetail ? '100%' : (typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : `${sidebarWidth}px`) }}
        className={`
          ${showMobileDetail ? 'hidden lg:flex' : 'flex'} 
          ${isResizing ? '' : 'transition-[width] duration-300'}
          flex-col border-r border-border-subtle bg-surface-low shrink-0 h-full relative group/sidebar
        `}
      >
        {/* Resize Handle */}
        <div 
          onMouseDown={startResizing}
          className="hidden lg:block absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-accent/40 active:bg-accent transition-colors z-20"
        />

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
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Shield size={48} className="mb-4 text-muted-foreground opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                {role === 'maintainer' ? 'No created bounties' : 'No active items'}
              </p>
              
              {role === 'maintainer' && registeredRepos.length === 0 && (
                <div className="mt-6 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                   <p className="text-[10px] text-muted-foreground font-bold uppercase mb-3">Onboarding Tip</p>
                   <p className="text-xs text-foreground/70 mb-4 leading-relaxed">Connect your GitHub repository to start adding issues as bounties.</p>
                   <Link href="/maintainer/setup" className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                      <Github size={12} />
                      Connect Repos
                   </Link>
                </div>
              )}

              {role === 'maintainer' && registeredRepos.length > 0 && (
                 <p className="text-[10px] text-muted-foreground font-medium mt-2 italic">Use the "Post New Bounty" button above to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right Pane - Detail View */}
      <div className={`
        ${showMobileDetail ? 'flex' : 'hidden lg:flex'} 
        flex-1 h-full overflow-hidden flex flex-col bg-surface-low
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
        
        <div className="flex-1 flex flex-col overflow-hidden">
           {selectedIssue ? (
             <IssueDetail issue={selectedIssue} />
           ) : (
        <div className="h-full flex flex-col items-center justify-center bg-surface-low opacity-30">
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="relative mb-6">
               <Loader2 className="animate-spin text-accent" size={48} />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-accent rounded-full" />
               </div>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground/50">
               {role === 'maintainer' ? 'View active bounties you created' : 'Select a bounty and apply'}
            </p>
            <div className="w-12 h-0.5 bg-accent/20 mt-4 rounded-full" />
          </div>
        </div>
           )}
        </div>
      </div>
    </div>
  );
}

