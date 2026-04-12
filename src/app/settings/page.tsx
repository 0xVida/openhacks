'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-xl mx-auto pt-20">
         <div className="flex items-center gap-4 mb-12">
            <Settings size={32} className="text-accent" strokeWidth={1.5} />
            <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase">Settings</h1>
         </div>
         <div className="space-y-6">
            {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center justify-between p-6 bg-surface-low border border-border-subtle rounded-2xl">
                  <div className="h-4 bg-surface-high rounded w-32"></div>
                  <div className="w-12 h-6 bg-surface-high rounded-full"></div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
