'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Filter, SortAsc, ArrowLeft, Plus, Code2, ExternalLink, Shield, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import IssueCard, { Issue } from '@/components/ui/IssueCard';
import IssueDetail from '@/components/ui/IssueDetail';
import { useRole } from '@/components/providers/role-context';
import Github from '@/components/ui/GithubIcon';
import SuccessModal from '@/components/ui/SuccessModal';
import OnboardingModal from '@/components/ui/OnboardingModal';
import { useSearchParams, useRouter } from 'next/navigation';

function HomeContent() {
  const { role, registeredRepos, githubUser } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [bounties, setBounties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info', text: string } | null>(null);
  
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // Funding & Modal State
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [fundingData, setFundingData] = useState<{
    title: string;
    message: string;
    checkoutUrl?: string;
    sessionId?: string;
    bountyId?: string;
  }>({ title: '', message: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Capture payment status from URL
  useEffect(() => {
    const success = searchParams.get('payment_success');
    const cancelled = searchParams.get('cancelled');
    const error = searchParams.get('error');

    if (success) {
      setStatusMessage({ type: 'success', text: 'Bounty successfully funded and activated!' });
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (cancelled) {
      setStatusMessage({ type: 'info', text: 'Payment session was cancelled. The bounty remains as "Pending Funding".' });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (error) {
      setStatusMessage({ type: 'info', text: `Operation failed: ${error}` });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

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
            issueNumber: !isNaN(parseInt(String(b.issue_number))) ? parseInt(String(b.issue_number)) : 0,
            author: b.repo_fullname.split('/')[0],
            points: b.reward_amount,
            reward: b.reward_amount,
            status: b.status,
            maintainer_id: b.maintainer_id,
            locus_checkout_url: b.locus_checkout_url,
            labels: b.tags && b.tags.length > 0 ? b.tags : ['GitHub Issue']
          }));

          const filtered = transformed.filter((b: any) => {
            // UNIFIED FILTER FOR MAINTAINERS: If I created it, I see it. (Open OR Pending)
            if (role === 'maintainer') {
              return (githubUser?.id && b.maintainer_id === githubUser.id) || registeredRepos.includes(b.repoFullName);
            }

            // FILTER FOR CONTRIBUTORS: See everything that is active ('open')
            const matchesRole = b.status === 'open';
            const matchesTag = selectedTag ? b.labels.includes(selectedTag) : true;
            
            return matchesRole && matchesTag;
          });

          setBounties(filtered);
          // Only select the first one if nothing is currently selected
          if (filtered.length > 0 && !selectedIssue) {
            setSelectedIssue(filtered[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBounties();
  }, [role, registeredRepos, githubUser]);

  const handleFundNow = async (issue: any) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/maintainer/bounty/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bountyId: issue.id }),
      });
      
      const result = await response.json();
      if (result.success) {
        setFundingData({
          title: result.data.title,
          message: result.data.message,
          checkoutUrl: result.data.checkoutUrl,
          sessionId: result.data.sessionId,
          bountyId: result.data.bountyId
        });
        setShowFundingModal(true);
        // We do NOT window.open here. The SuccessModal will handle the click.
      } else {
        alert(result.error || "Failed to refresh funding session.");
      }
    } catch (e) {
      console.error('Refresh funding error:', e);
      alert("Technical error while preparing checkout.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectIssue = (issue: any) => {
    setSelectedIssue(issue);
    setShowMobileDetail(true);
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden relative">
      <div 
        style={mounted ? { width: `${sidebarWidth}px` } : {}}
        className={`
          w-full lg:w-[320px]
          ${showMobileDetail ? 'hidden lg:flex' : 'flex'} 
          ${isResizing ? '' : (mounted ? 'transition-[width] duration-300' : '')}
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
              {role === 'maintainer' ? 'Your Bounties' : 'Open Bounties'}
            </h2>
            <div className="flex gap-2 text-muted-foreground">
              <button className="bg-surface-high p-2 rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-in slide-in-from-top-4 duration-500 ${
              statusMessage.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">{statusMessage.text}</p>
              </div>
              <button onClick={() => setStatusMessage(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {role === 'maintainer' && (
            <Link 
              href="/maintainer/create"
              className="w-full py-4 bg-accent text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-accent-hover transition-all group overflow-hidden relative shadow-xl shadow-accent/20"
            >
               <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
               <span className="text-xs font-black uppercase tracking-widest">Post New Bounty</span>
            </Link>
          )}

          {/* Tag Filter */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skill Tags</span>
              {selectedTag && (
                <button 
                  onClick={() => setSelectedTag(null)}
                  className="text-[9px] font-black uppercase text-accent hover:underline decoration-2 underline-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {['Rust', 'Next.js', 'Solidity', 'AI', 'Security', 'DevOps'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`
                    px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                    ${selectedTag === tag 
                      ? 'bg-accent text-white border-accent shadow-md shadow-accent/10' 
                      : 'bg-surface-high text-muted-foreground border-border-subtle hover:border-accent/30'}
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : bounties.map((issue) => (
            <div key={issue.id} onClick={() => handleSelectIssue(issue)}>
              <IssueCard 
                issue={issue} 
                active={selectedIssue?.id === issue.id} 
                onFundNow={() => handleFundNow(issue)}
              />
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
                   <div className="mt-4 pt-4 border-t border-accent/10">
                     <a href="/docs" className="text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-widest">View Documentation</a>
                   </div>
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
             <IssueDetail 
               issue={selectedIssue} 
               onFundNow={() => handleFundNow(selectedIssue)}
             />
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
      <OnboardingModal />
      <SuccessModal 
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        title={fundingData.title}
        message={fundingData.message}
        actionHref={fundingData.checkoutUrl}
        actionText="Proceed to Checkout"
        sessionId={fundingData.sessionId}
        bountyId={fundingData.bountyId}
        hideSecondaryAction={true}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-surface-low">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-accent" size={48} />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Initializing OpenHacks...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
