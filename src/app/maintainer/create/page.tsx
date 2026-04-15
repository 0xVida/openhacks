'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Zap,
  Video,
  Palette,
  Code2,
  UserCheck,
  Trophy,
  Info,
  ChevronRight,
  Globe,
  Settings2,
  Loader2,
  Search
} from 'lucide-react';
import { useRole } from '@/components/providers/role-context';
import SuccessModal from '@/components/ui/SuccessModal';

type BountyType = 'issue';
type ExecutionMode = 'open' | 'proposal';

export default function CreateBountyPage() {
  const router = useRouter();
  const { githubUser, selectedRepo: contextRepo } = useRole();
  const [type, setType] = useState<BountyType>('issue');
  const [mode, setMode] = useState<ExecutionMode>('open');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [successData, setSuccessData] = useState<{ title: string, message: string }>({ title: '', message: '' });

  // Repos & Issues State
  const [repos, setRepos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [searchIssue, setSearchIssue] = useState('');
  const [showIssuePicker, setShowIssuePicker] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repo, setRepo] = useState(contextRepo || '');
  const [issueNumber, setIssueNumber] = useState('');
  const [reward, setReward] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Predefined Skill Options
  const AVAILABLE_SKILLS = ['Rust', 'Next.js', 'Solidity', 'AI', 'Security', 'DevOps'];

  // Fetch Repos on mount
  React.useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch('/api/github/repos');
        const data = await response.json();
        if (data.repos) {
          setRepos(data.repos);
          if (!repo && data.repos.length > 0) {
            setRepo(data.repos[0].full_name);
          }
        }
      } catch (e) {
        console.error('Error fetching repos:', e);
      }
    }
    fetchRepos();
  }, []);

  // Fetch Issues when repo changes
  React.useEffect(() => {
    if (!repo) return;
    async function fetchIssues() {
      setIsFetchingIssues(true);
      try {
        const response = await fetch(`/api/github/issues?repo=${repo}`);
        const data = await response.json();
        if (data.issues) {
          setIssues(data.issues);
        }
      } catch (e) {
        console.error('Error fetching issues:', e);
      } finally {
        setIsFetchingIssues(false);
      }
    }
    fetchIssues();
  }, [repo]);

  const handleSelectIssue = (issue: any) => {
    setTitle(issue.title);
    setDescription(issue.body);
    setIssueNumber(issue.number.toString());
    setShowIssuePicker(false);
  };

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleLaunchBounty = async () => {
    if (!title || !description || !repo || !issueNumber || !reward) {
      setSuccessData({
        title: "Incomplete Form",
        message: "Please fill in all required fields including the bounty amount and issue details before launching."
      });
      setIsError(true);
      setShowSuccess(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/maintainer/bounty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          repo,
          issueNumber,
          reward: parseFloat(reward),
          tags,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.locus?.checkoutUrl) {
        setSuccessData({
          title: "Bounty Initialized",
          message: "Redirecting to Locus secure checkout to fund your bounty..."
        });
        setIsError(false);
        setShowSuccess(true);
        
        // Automatic redirect to Locus after a brief confirmation
        setTimeout(() => {
          window.location.href = result.data.locus.checkoutUrl;
        }, 2000);
      } else if (result.success) {
        setSuccessData({
          title: "Bounty Launched",
          message: "The bounty has been successfully created and recorded."
        });
        setIsError(false);
        setShowSuccess(true);
      } else {
        setSuccessData({
          title: "Launch Failed",
          message: result.error || result.message || "An error occurred while creating the bounty. Please check your balance and try again."
        });
        setIsError(true);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error launching bounty:', error);
      setSuccessData({
        title: "System Error",
        message: "We encountered a technical issue while processing your request. Please try again or contact support if the problem persists."
      });
      setIsError(true);
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 bg-surface-low overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-12 lg:p-16">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-tight">Back to Dashboard</span>
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">Create New Bounty</h1>
            <p className="text-muted-foreground font-medium text-lg">Define how you want contributors to help your project.</p>
          </header>

          <div className="space-y-12 pb-24">
            <section>
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Select Project</h2>
              <div className="bg-surface-mid border border-border-subtle rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-foreground uppercase tracking-widest block">Repository</label>
                    <div className="relative group">
                      <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
                      <select
                        disabled={isLoading}
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent/50 appearance-none font-bold"
                      >
                        {repos.map(r => (
                          <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={() => setShowIssuePicker(!showIssuePicker)}
                      className="w-full h-[60px] bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center gap-2 font-black text-accent uppercase tracking-widest text-xs hover:bg-accent/20 transition-all active:scale-[0.98]"
                    >
                      <Zap size={16} />
                      GRAB ISSUES FROM REPO
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {showIssuePicker && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Live GitHub Issues</h2>
                  <div className="relative flex-1 max-w-xs ml-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                      type="text"
                      placeholder="Filter issues..."
                      value={searchIssue}
                      onChange={(e) => setSearchIssue(e.target.value)}
                      className="w-full bg-surface-mid border border-border-subtle rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-accent/40"
                    />
                  </div>
                </div>

                <div className="bg-surface-mid border border-border-subtle rounded-[2rem] overflow-hidden">
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {isFetchingIssues ? (
                      <div className="flex flex-col items-center justify-center py-12 opacity-50">
                        <Loader2 className="animate-spin text-accent mb-2" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Scanning Repository...</span>
                      </div>
                    ) : issues.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground font-medium text-sm italic">
                        No open issues found in this repository.
                      </div>
                    ) : (
                      <div className="divide-y divide-border-subtle/50">
                        {issues.filter(i => i.title.toLowerCase().includes(searchIssue.toLowerCase())).map(issue => (
                          <button
                            key={issue.id}
                            onClick={() => handleSelectIssue(issue)}
                            className="w-full p-6 hover:bg-surface-high transition-colors flex items-start gap-4 text-left group"
                          >
                            <span className="text-accent font-black text-xs shrink-0 mt-0.5">#{issue.number}</span>
                            <div className="flex-1">
                              <h3 className="font-black text-foreground uppercase tracking-tight text-sm mb-1 group-hover:text-accent transition-colors">{issue.title}</h3>
                              <div className="flex flex-wrap gap-2">
                                {issue.labels.map((l: string) => (
                                  <span key={l} className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md bg-surface-high border border-border-subtle text-muted-foreground">{l}</span>
                                ))}
                              </div>
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground mt-1 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Bounty Details</h2>
              <div className="bg-surface-mid border border-border-subtle rounded-3xl p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest block">Bounty Title</label>
                  <input
                    disabled={isLoading}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Implement Locus payment hook..."
                    className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-accent/50 font-bold placeholder:opacity-30"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest block">Detailed Description</label>
                  <textarea
                    disabled={isLoading}
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the scope of work, technical requirements, and acceptance criteria..."
                    className="w-full bg-surface-high border border-border-subtle rounded-3xl py-4 px-6 text-foreground focus:outline-none focus:border-accent/50 font-medium placeholder:opacity-30 scrollbar-hide text-sm"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest block">Skill Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`
                          px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                          ${tags.includes(tag) 
                            ? 'bg-accent text-white border-accent shadow-md shadow-accent/20' 
                            : 'bg-surface-high text-muted-foreground border-border-subtle hover:border-accent/40'}
                        `}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest block">Issue Number</label>
                  <input
                    disabled={isLoading}
                    type="number"
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(e.target.value)}
                    placeholder="#123"
                    className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-accent/50 font-bold max-w-[200px]"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-6">Execution & Reward</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 flex flex-col gap-4 h-full">
                     <label className="text-xs font-black text-foreground uppercase tracking-widest">Agent Workflow</label>
                     <div className="flex items-start gap-3 text-[10px] text-muted-foreground bg-black/5 p-4 rounded-xl border border-border-subtle italic leading-relaxed">
                        <Zap size={16} className="shrink-0 text-accent opacity-70 mt-0.5" />
                        <span>This bounty is <strong>Open</strong>. Intelligent agents and contributors will submit PRs directly to the repository. The maintainer will merge and reward the most effective implementation.</span>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 flex flex-col gap-4">
                    <label className="text-xs font-black text-foreground uppercase tracking-widest">Reward Pool (USDC)</label>
                    <div className="relative group">
                      <Trophy className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={24} />
                      <input
                        disabled={isLoading}
                        type="number"
                        value={reward}
                        onChange={(e) => setReward(e.target.value)}
                        placeholder="Amount"
                        className="w-full bg-surface-high border-2 border-accent/20 rounded-2xl py-6 pl-16 pr-6 text-2xl font-black text-foreground focus:outline-none focus:border-accent shadow-inner transition-all placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-12 border-t border-border-subtle flex flex-col sm:flex-row gap-4">
              <button
                disabled={isLoading}
                onClick={handleLaunchBounty}
                className={`flex-[2] py-5 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black transition-all shadow-2xl shadow-accent/30 tracking-tight flex items-center justify-center gap-3 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Zap size={22} fill="currentColor" />
                )}
                {isLoading ? 'LAUNCHING...' : 'LAUNCH BOUNTY'}
              </button>
              <button
                disabled={isLoading}
                className="flex-1 py-5 bg-surface-mid hover:bg-surface-high border border-border-subtle text-foreground rounded-3xl font-black transition-all tracking-tight flex items-center justify-center gap-2"
              >
                <Settings2 size={18} />
                SAVE DRAFT
              </button>
            </div>
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          if (!isError) {
            setTitle('');
            setDescription('');
            setIssueNumber('');
            setReward('');
          }
        }}
        title={successData.title}
        message={successData.message}
        isError={isError}
        actionHref="/"
        actionText="Dashboard"
      />
    </>
  );
}
