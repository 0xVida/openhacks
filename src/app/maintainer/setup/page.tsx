'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  GitBranch, 
  ExternalLink, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Settings2,
  Lock,
  Loader2
} from 'lucide-react';
import { useRole } from '@/components/providers/role-context';
import RootContainer from '@/components/layout/RootContainer';

export default function MaintainerSetupPage() {
  const router = useRouter();
  const { githubUser, selectedRepo, setSelectedRepo } = useRole();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [realRepos, setRealRepos] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);

  React.useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch('/api/github/repos');
        const data = await response.json();
        if (data.repos) {
          setRealRepos(data.repos);
        }
      } catch (error) {
        console.error('Error fetching repos:', error);
      } finally {
        setIsLoadingRepos(false);
      }
    }
    fetchRepos();
  }, []);

  const filteredRepos = realRepos.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectRepo = (repo: string) => {
    setSelectedRepo(repo);
    setStep(2);
  };

  const handleInstallApp = () => {
    setIsInstalling(true);
    // Simulate GitHub App installation redirect/success
    setTimeout(() => {
      setIsInstalling(false);
      setStep(3);
    }, 2000);
  };

  const finalizeSetup = () => {
    router.push('/');
  };

  if (!githubUser) {
    router.push('/onboarding');
    return null;
  }

  return (
    <RootContainer>
      <div className="flex-1 bg-surface-low overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-accent/20">
                   <img src={githubUser.avatar_url} alt={githubUser.login} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-black text-foreground uppercase tracking-tight leading-none mb-1">{githubUser.name}</h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">@{githubUser.login}</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <SetupStep number={1} active={step === 1} completed={step > 1} />
                <div className="w-8 h-px bg-border-subtle" />
                <SetupStep number={2} active={step === 2} completed={step > 2} />
                <div className="w-8 h-px bg-border-subtle" />
                <SetupStep number={3} active={step === 3} completed={step > 3} />
             </div>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">Choose Repository</h1>
              <p className="text-muted-foreground mb-8 font-medium">Select the project you want to manage with OpenHacks.</p>
              
              <div className="relative group mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search your repositories..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-mid border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent/40 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {isLoadingRepos ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 size={40} className="animate-spin text-accent mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Fetching Repositories...</p>
                  </div>
                ) : filteredRepos.map(repo => (
                  <button 
                    key={repo.full_name}
                    onClick={() => handleSelectRepo(repo.full_name)}
                    className="flex items-center justify-between p-5 bg-surface-high border border-border-subtle rounded-3xl hover:border-accent/40 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-mid flex items-center justify-center text-muted-foreground group-hover:text-accent transition-colors">
                        <GitBranch size={20} />
                      </div>
                      <div>
                        <span className="font-black text-foreground uppercase tracking-tight block">{repo.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{repo.full_name}</span>
                      </div>
                    </div>
                    <Plus size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">Install GitHub App</h1>
              <p className="text-muted-foreground mb-10 font-medium">To automate payouts and track issues, you need to install the OpenHacks App on <span className="text-foreground font-black underline decoration-accent">{selectedRepo}</span>.</p>
              
              <div className="bg-surface-mid border border-border-subtle rounded-[2.5rem] p-8 mb-10">
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
                          <ShieldCheck size={20} />
                       </div>
                       <div>
                          <h3 className="font-black text-foreground uppercase tracking-tight text-sm mb-1">Permission Required</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">The app needs read/write access to issues and pull requests to manage bounties and trigger payments.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-surface-high text-muted-foreground flex items-center justify-center shrink-0 border border-border-subtle">
                          <Settings2 size={20} />
                       </div>
                       <div>
                          <h3 className="font-black text-foreground uppercase tracking-tight text-sm mb-1">Webhook Configuration</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">Automated setup. No manual config required after installation.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleInstallApp}
                disabled={isInstalling}
                className="w-full py-6 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black text-xl transition-all shadow-2xl shadow-accent/20 flex items-center justify-center gap-4 group disabled:opacity-70"
              >
                {isInstalling ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    INSTALL ON GITHUB
                    <ExternalLink size={20} />
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setStep(1)}
                className="w-full py-4 text-muted-foreground font-black text-xs uppercase tracking-widest mt-4 hover:text-foreground transition-colors"
              >
                Change Repository
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in fade-in zoom-in duration-500 py-12">
               <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-green-500/10 text-green-500 mb-8 border border-green-500/20 shadow-2xl shadow-green-500/10">
                  <CheckCircle2 size={48} />
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight mb-4">Configuration Live!</h1>
               <p className="text-muted-foreground text-lg font-medium mb-12 max-w-md mx-auto">OpenHacks is now monitoring <span className="text-foreground font-black">{selectedRepo}</span>. Your first bounty is ready to be launched.</p>
               
               <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                 <button 
                   onClick={finalizeSetup}
                   className="w-full py-5 bg-accent hover:bg-accent-hover text-white rounded-3xl font-black transition-all shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 active:scale-95 group"
                 >
                   GO TO DASHBOARD
                   <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </RootContainer>
  );
}

function SetupStep({ number, active, completed }: { number: number, active: boolean, completed: boolean }) {
  if (completed) {
    return <CheckCircle2 className="text-green-500 shrink-0" size={24} />;
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 border-2 transition-all ${
      active ? 'bg-accent border-accent text-white shadow-lg' : 'bg-surface-mid border-border-subtle text-muted-foreground'
    }`}>
      {number}
    </div>
  );
}
