'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Clock, User, Briefcase, Zap } from 'lucide-react';

export default function ApplyPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-accent transition-all mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO ISSUE #{id}
        </Link>
        
        <header className="mb-12">
           <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tighter">Submit Application</h1>
           <p className="text-gray-500 dark:text-gray-300 font-medium text-sm md:text-base">Demonstrate your expertise and outline your strategic approach for this contribution.</p>
        </header>
        
        <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
           <div className="space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-200 uppercase tracking-[0.2em]">
                 <Briefcase size={14} className="text-accent" />
                 Relevant Experience
              </label>
              <textarea 
                 placeholder="Share your track record with Rust, Stellar, or similar technologies..."
                 className="w-full bg-surface-mid border border-border-subtle rounded-2xl p-5 text-foreground focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all h-32 resize-none text-sm leading-relaxed"
              />
           </div>
           
           <div className="space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-200 uppercase tracking-[0.2em]">
                 <Zap size={14} className="text-accent" />
                 Proposed Technical Approach
              </label>
              <textarea 
                 placeholder="How do you plan to solve this issue? Be specific about your steps..."
                 className="w-full bg-surface-mid border border-border-subtle rounded-2xl p-5 text-foreground focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all h-48 resize-none text-sm leading-relaxed"
              />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-200 uppercase tracking-[0.2em]">
                    <Clock size={14} className="text-accent" />
                    Estimated Duration (Days)
                 </label>
                 <input 
                    type="number" 
                    placeholder="3"
                    className="w-full bg-surface-mid border border-border-subtle rounded-2xl p-5 text-foreground focus:outline-none focus:border-accent/40 transition-all font-bold"
                 />
              </div>
              <div className="space-y-3">
                 <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-200 uppercase tracking-[0.2em]">
                    <User size={14} className="text-accent" />
                    Discord / Contact Handle
                 </label>
                 <input 
                    type="text" 
                    placeholder="@username"
                    className="w-full bg-surface-mid border border-border-subtle rounded-2xl p-5 text-foreground focus:outline-none focus:border-accent/40 transition-all font-bold"
                 />
              </div>
           </div>
           
           <div className="pt-10">
              <button className="w-full py-5 bg-accent hover:bg-accent-hover text-white rounded-2xl font-black transition-all shadow-2xl shadow-accent/20 text-lg flex items-center justify-center gap-3 active:scale-[0.98]">
                 <Send size={20} />
                 SUBMIT APPLICATION
              </button>
              <p className="text-center text-[9px] text-gray-400 dark:text-gray-300 mt-6 uppercase font-black tracking-[0.3em] opacity-60">
                 Application will be reviewed by Stellar-Fluid Maintainers
              </p>
           </div>
        </form>
      </div>
    </div>
  );
}
