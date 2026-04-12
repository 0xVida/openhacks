'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-xl mx-auto pt-20 text-center">
         <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-surface-low shadow-xl">
            <User size={64} className="text-accent" strokeWidth={1.5} />
         </div>
         <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase mb-2">Degenerate Alchemist</h1>
         <p className="text-accent font-bold tracking-widest text-xs uppercase mb-8">Elite Contributor</p>
         <div className="grid grid-cols-3 gap-4">
            {['Points', 'Quests', 'Rank'].map(label => (
               <div key={label} className="p-4 bg-surface-low border border-border-subtle rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                  <div className="h-4 bg-surface-high rounded w-full"></div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
