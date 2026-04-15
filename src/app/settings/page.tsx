'use client';

import React from 'react';
import {
   Settings as SettingsIcon,
   LogOut,
   Shield,
   Bell,
   User as UserIcon,
   ChevronRight,
   Zap,
   UserCircle
} from 'lucide-react';
import Github from '@/components/ui/GithubIcon';
import { useRole } from '@/components/providers/role-context';
import { signOut, signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
   const { role, setRole, githubUser, setGithubUser } = useRole();
   const [copied, setCopied] = React.useState(false);

   return (
      <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-low">
         <div className="max-w-3xl mx-auto pt-20">
            <div className="flex items-center gap-4 mb-16 px-4">
               <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20">
                  <SettingsIcon size={24} strokeWidth={2} />
               </div>
               <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight italic uppercase">Settings</h1>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">Manage your hacker profile and preferences</p>
               </div>
            </div>

            <div className="space-y-4">
               {/* Account Info */}
               <div className="p-8 bg-surface-mid border border-border-subtle rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-surface-high transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-accent/20 bg-accent/5 flex items-center justify-center text-accent">
                        {githubUser?.avatar_url ? (
                           <img src={githubUser.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                           <UserCircle size={40} strokeWidth={1} />
                        )}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                           {githubUser ? 'Signed in as' : 'Browse Mode'}
                        </p>
                        <p className="text-xl font-black text-foreground uppercase tracking-tight">
                           {githubUser?.login || 'Anonymous Hacker'}
                        </p>
                     </div>
                  </div>

                  {githubUser ? (
                     <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent font-black text-[10px] uppercase tracking-widest">
                        GitHub Linked
                     </div>
                  ) : (
                     <button
                        onClick={() => signIn('github')}
                        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-lg"
                     >
                        <Github size={14} />
                        Connect Account
                     </button>
                  )}
               </div>

               {/* Role Preference */}
               <div className="p-8 bg-surface-mid border border-border-subtle rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <Shield size={20} className="text-accent" />
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Active Role</h3>
                     </div>
                     {!githubUser && (
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full">Preview Mode</span>
                     )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        onClick={() => githubUser && setRole('contributor')}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'contributor' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-surface-high opacity-50 grayscale hover:grayscale-0'
                           } ${!githubUser ? 'cursor-not-allowed' : ''}`}
                        disabled={!githubUser}
                     >
                        <UserIcon size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">Contributor</span>
                     </button>
                     <button
                        onClick={() => githubUser && setRole('maintainer')}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'maintainer' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-surface-high opacity-50 grayscale hover:grayscale-0'
                           } ${!githubUser ? 'cursor-not-allowed' : ''}`}
                        disabled={!githubUser}
                     >
                        <Shield size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">Maintainer</span>
                     </button>
                  </div>
                  {!githubUser && (
                     <p className="text-[10px] text-muted-foreground font-medium mt-6 leading-relaxed italic text-center">
                        Note: Role preferences will reset when you leave the site unless you are signed in.
                     </p>
                  )}
               </div>

               {/* API Access for Agents */}
               {githubUser && (
                  <div className="p-8 bg-surface-mid border border-border-subtle rounded-[2.5rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={120} className="text-accent" />
                     </div>

                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                           <Zap size={20} className="text-accent" />
                           <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Agent Access</h3>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${githubUser.api_key ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {githubUser.api_key ? 'Autonomous Active' : 'No Key Generated'}
                           </span>
                        </div>
                     </div>

                     <div className="space-y-6 relative z-10">
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                           Generate a secure **OpenHacks API Key** to allow your autonomous agents to manage bounties, create issues, and review PRs on your behalf.
                        </p>

                        {githubUser.api_key ? (
                           <div className="space-y-4">
                              <div className="relative">
                                 <input
                                    readOnly
                                    type="password"
                                    value={githubUser.api_key}
                                    className="w-full bg-surface-high border border-border-subtle rounded-2xl py-4 pl-6 pr-24 text-foreground font-mono text-sm focus:outline-none"
                                 />
                                 <button
                                    onClick={() => {
                                       if (githubUser.api_key) {
                                          navigator.clipboard.writeText(githubUser.api_key);
                                          setCopied(true);
                                          setTimeout(() => setCopied(false), 2000);
                                       }
                                    }}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${copied ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-surface-low hover:bg-surface-mid border-border-subtle text-muted-foreground'}`}
                                 >
                                    {copied ? 'Copied!' : 'Copy key'}
                                 </button>
                              </div>
                              <div className="flex gap-3">
                                 <button
                                    onClick={async () => {
                                       const res = await fetch('/api/user/status', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ action: 'generate_key' })
                                       });
                                       const data = await res.json();
                                       if (data.success) {
                                          // Update context localially
                                          setGithubUser({ ...githubUser, api_key: data.api_key });
                                       }
                                    }}
                                    className="text-[10px] font-black underline uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
                                 >
                                    Rotate Key
                                 </button>
                                 <button
                                    onClick={async () => {
                                       if (confirm('Revoke access? Your agents will stop working immediately.')) {
                                          const res = await fetch('/api/user/status', {
                                             method: 'PUT',
                                             headers: { 'Content-Type': 'application/json' },
                                             body: JSON.stringify({ action: 'revoke_key' })
                                          });
                                          if ((await res.json()).success) {
                                             setGithubUser({ ...githubUser, api_key: undefined });
                                          }
                                       }
                                    }}
                                    className="text-[10px] font-black underline uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                                 >
                                    Revoke access
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <button
                              onClick={async () => {
                                 const res = await fetch('/api/user/status', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'generate_key' })
                                 });
                                 const data = await res.json();
                                 if (data.success) {
                                    setGithubUser({ ...githubUser, api_key: data.api_key });
                                 }
                              }}
                              className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all shadow-xl hover:shadow-accent/20"
                           >
                              Generate OpenHacks API Key
                           </button>
                        )}
                     </div>
                  </div>
               )}

               {/* Notifications (Mock for UI) */}
               <div className="p-8 bg-surface-mid border border-border-subtle rounded-[2.5rem] flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                     <Bell size={20} className="text-muted-foreground" />
                     <span className="text-xs font-black uppercase tracking-widest text-foreground">Email Notifications</span>
                  </div>
                  <div className="w-12 h-6 bg-border-subtle rounded-full relative">
                     <div className="absolute left-1 top-1 w-4 h-4 bg-muted-foreground rounded-full"></div>
                  </div>
               </div>

               {/* Documentation & Help */}
               <div className="p-8 bg-premium-gradient border border-border-subtle rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 mt-12">
                  <div>
                     <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">Platform Documentation</h3>
                     <p className="text-xs text-muted-foreground font-medium max-w-md">
                        Learn how to scale your project with autonomous agents, understand the reputation system, and master the OpenClaw protocol.
                     </p>
                  </div>
                  <Link 
                     href="/docs"
                     className="px-6 py-4 bg-surface-low hover:bg-surface-high border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 whitespace-nowrap shadow-xl"
                  >
                     Explore Docs
                     <ChevronRight size={14} />
                  </Link>
               </div>

               {/* Danger Zone */}
               {githubUser && (
                  <div className="pt-8 mt-12 border-t border-border-subtle">
                     <button
                        onClick={() => signOut()}
                        className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center justify-center gap-3 text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0 group shadow-lg"
                     >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}


