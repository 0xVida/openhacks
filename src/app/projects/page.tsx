'use client';

import React from 'react';
import { Layers } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-4xl mx-auto text-center pt-20">
         <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent/20">
            <Layers size={40} className="text-accent" strokeWidth={1.5} />
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter italic uppercase">Active Projects</h1>
         <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Explore all open-source repositories and initiatives currently looking for elite contributors.</p>
         <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[1, 2, 3, 4].map(i => (
               <div key={i} className="p-8 bg-surface-low border border-border-subtle rounded-3xl animate-pulse">
                  <div className="h-4 bg-surface-high rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-surface-high rounded w-1/2"></div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
