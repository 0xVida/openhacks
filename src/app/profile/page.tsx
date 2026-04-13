'use client';

import React from 'react';
import { User, ShieldAlert } from 'lucide-react';
import Github from '@/components/ui/GithubIcon';
import { useRole } from '@/components/providers/role-context';
import { signIn } from 'next-auth/react';

export default function ProfilePage() {
  const { githubUser, role } = useRole();
  const reputation = (githubUser as any)?.reputation || 0;

  if (!githubUser) {
    return (
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-xl mx-auto pt-20 text-center">
          <div className="w-32 h-32 bg-surface-mid rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-4 border-surface-low shadow-xl relative group">
             <User size={64} className="text-muted-foreground/30" strokeWidth={1.5} />
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white border-4 border-surface-low shadow-lg">
                <ShieldAlert size={20} />
             </div>
          </div>
          
          <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase mb-2">Guest Contributor</h1>
          <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase mb-12">Account Not Linked</p>
          
          <div className="bg-surface-mid border border-border-subtle p-10 rounded-[2.5rem] mb-12 shadow-sm text-center">
             <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 text-center">Unlock Your Reputation</h3>
             <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-xs mx-auto">
                Sign in with your GitHub account to start earning reputation points, tracking your contributions, and claiming bounties.
             </p>
             <button 
               onClick={() => signIn('github')}
               className="w-full py-4 bg-foreground text-background rounded-2xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all group font-black uppercase tracking-widest text-xs shadow-xl shadow-black/5 active:scale-95"
             >
                <Github size={18} />
                Connect GitHub Account
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 opacity-30 pointer-events-none">
             <div className="p-8 bg-surface-mid border border-border-subtle rounded-[2rem]">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Reputation Score</p>
                 <div className="text-4xl font-black text-foreground tabular-nums">0</div>
             </div>
             <div className="p-8 bg-surface-mid border border-border-subtle rounded-[2rem]">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Account Tier</p>
                 <div className="text-2xl font-black text-muted-foreground uppercase tracking-tighter">Level 1</div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-xl mx-auto pt-20 text-center">
         <div className="w-32 h-32 bg-accent/20 rounded-[2.5rem] overflow-hidden flex items-center justify-center mx-auto mb-8 border-4 border-surface-low shadow-2xl relative group">
            {githubUser?.avatar_url ? (
              <img src={githubUser.avatar_url} alt={githubUser.login} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <User size={64} className="text-accent" strokeWidth={1.5} />
            )}
         </div>
         <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase mb-2">
            {githubUser?.name || githubUser?.login}
         </h1>
         <p className="text-accent font-black tracking-[0.3em] text-[10px] uppercase mb-12 bg-accent/10 py-1.5 px-4 rounded-full inline-block border border-accent/20">
            {reputation > 500 ? 'Elite' : reputation > 100 ? 'Professional' : 'Rising'} {role.toUpperCase()}
         </p>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-surface-mid border-2 border-accent/10 rounded-[2rem] shadow-xl shadow-accent/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Reputation Score</p>
                <div className="text-4xl font-black text-foreground tabular-nums">{reputation}</div>
            </div>
            <div className="p-8 bg-surface-mid border-2 border-border-subtle rounded-[2rem]">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Account Tier</p>
                <div className="text-2xl font-black text-accent uppercase tracking-tighter">Level {Math.floor(reputation / 100) + 1}</div>
            </div>
         </div>
      </div>
    </div>
  );
}


