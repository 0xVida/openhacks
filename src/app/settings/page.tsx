'use client';

import React from 'react';
import { 
  Settings as SettingsIcon, 
  LogOut, 
  Shield, 
  Bell, 
  User as UserIcon,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import Github from '@/components/ui/GithubIcon';
import { useRole } from '@/components/providers/role-context';
import { signOut, signIn } from 'next-auth/react';

export default function SettingsPage() {
  const { role, setRole, githubUser } = useRole();

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
                     className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                        role === 'contributor' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-surface-high opacity-50 grayscale hover:grayscale-0'
                     } ${!githubUser ? 'cursor-not-allowed' : ''}`}
                     disabled={!githubUser}
                   >
                     <UserIcon size={24} />
                     <span className="text-xs font-black uppercase tracking-widest">Contributor</span>
                  </button>
                  <button 
                     onClick={() => githubUser && setRole('maintainer')}
                     className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                        role === 'maintainer' ? 'border-accent bg-accent/5' : 'border-border-subtle bg-surface-high opacity-50 grayscale hover:grayscale-0'
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


