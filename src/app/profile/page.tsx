'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { githubUser, role } = useRole();
  const reputation = (githubUser as any)?.reputation || 0;

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
            {githubUser?.name || githubUser?.login || 'Shadow Hacker'}
         </h1>
         <p className="text-accent font-black tracking-[0.3em] text-[10px] uppercase mb-12 bg-accent/10 py-1.5 px-4 rounded-full inline-block border border-accent/20">
            {reputation > 500 ? 'Elite' : reputation > 100 ? 'Professional' : 'Rising'} {role.toUpperCase()}
         </p>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-surface-mid border-2 border-accent/10 rounded-[2rem] shadow-xl shadow-accent/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Reputation Score</p>
                <div className="text-4xl font-black text-foreground tabular-nums">{reputation}</div>
            </div>
            <div className="p-8 bg-surface-mid border-2 border-border-subtle rounded-[2rem]">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Account Tier</p>
                <div className="text-2xl font-black text-accent uppercase tracking-tighter">Level {Math.floor(reputation / 100) + 1}</div>
            </div>
         </div>
      </div>
    </div>
  );
}

