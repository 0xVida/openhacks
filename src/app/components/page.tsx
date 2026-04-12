'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';

export default function ComponentsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-4xl mx-auto text-center pt-20">
         <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent/20">
            <LayoutGrid size={40} className="text-accent" strokeWidth={1.5} />
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter italic uppercase">Components</h1>
         <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Standardized UI primitives and patterns for the OpenBags ecosystem.</p>
         <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
               <div key={i} className="aspect-square bg-surface-low border border-border-subtle rounded-2xl flex items-center justify-center text-[10px] font-black uppercase text-gray-400">
                  Primitive {i}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
