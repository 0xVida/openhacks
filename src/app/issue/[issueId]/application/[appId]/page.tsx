'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Code2, 
  Terminal, 
  Globe, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Award,
  Zap,
  Building2,
  FileText,
  MessageSquare,
  ThumbsUp,
  XCircle
} from 'lucide-react';
export default function ApplicationDetailPage() {
  return (
    <>
      <div className="flex-1 bg-surface-low overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-12">
          {/* Header */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-tight">Back to Issue</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Left Column: Applicant Profile */}
            <div className="lg:w-80 shrink-0 space-y-6">
              <div className="bg-surface-mid border border-border-subtle rounded-3xl p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20" title="Verified Contributor">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                
                <div className="w-24 h-24 rounded-full bg-surface-high border-4 border-border-subtle mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User size={48} className="text-muted-foreground" />
                </div>
                
                <h1 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">Charles Chinedum</h1>
                <p className="text-xs font-bold text-accent uppercase tracking-[0.2em] mb-6">Master Contributor</p>
                
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <button className="p-2 hover:text-foreground hover:bg-surface-high rounded-xl transition-all">
                    <Code2 size={20} />
                  </button>
                  <button className="p-2 hover:text-foreground hover:bg-surface-high rounded-xl transition-all">
                    <Globe size={20} />
                  </button>
                  <button className="p-2 hover:text-foreground hover:bg-surface-high rounded-xl transition-all">
                    <Mail size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-surface-mid border border-border-subtle rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Award size={18} className="text-accent" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reputation</span>
                  </div>
                  <span className="text-sm font-black text-foreground tracking-tight">4,850</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed</span>
                  </div>
                  <span className="text-sm font-black text-foreground tracking-tight">24 Issues</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-orange-500" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reliability</span>
                  </div>
                  <span className="text-sm font-black text-foreground tracking-tight">99.2%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Proposal Content */}
            <div className="flex-1 space-y-8">
              <div className="bg-surface-mid border border-border-subtle rounded-3xl p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.2em] text-xs mb-8 pb-4 border-b border-border-subtle">
                  <FileText size={20} />
                  Proposed Solution
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-medium">
                  <p>
                    Hey there! I've spent the last few weeks diving deep into the Soroban environment, specifically focusing on the storage model and how its handled in the REPL. 
                  </p>
                  <p>
                    The proposed fix for the <code className="bg-accent/10 px-1.5 py-0.5 rounded text-accent">compute_diff</code> filter is something I've actually implemented in a private fork for my own testing. I plan to introduce a tiered filtering system:
                  </p>
                  <ul className="space-y-4 my-6">
                    <li><strong>Key-based regex:</strong> Filter by specific ledger entry keys.</li>
                    <li><strong>Namespace filtering:</strong> Group storage by contract domain.</li>
                    <li><strong>Value diffing:</strong> Only show entries where the value change exceeds a specific threshold.</li>
                  </ul>
                  <p>
                    I can have a PR ready by Wednesday with full unit test coverage and a breakdown of the new CLI flags. Looking forward to contributing!
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t border-border-subtle">
                   <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Relevant Experience</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-surface-high border border-border-subtle p-4 rounded-2xl flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Building2 size={18} />
                         </div>
                         <div>
                            <span className="text-xs font-black text-foreground block uppercase tracking-tight">Stellar Core</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">PR #4852 Contributor</span>
                         </div>
                      </div>
                      <div className="bg-surface-high border border-border-subtle p-4 rounded-2xl flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Terminal size={18} />
                         </div>
                         <div>
                            <span className="text-xs font-black text-foreground block uppercase tracking-tight">soroban-rs-sdk</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">V0.8 Maintenance</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Management Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-5 bg-accent hover:bg-accent-hover text-white rounded-2xl font-black transition-all shadow-xl shadow-accent/30 tracking-tight flex items-center justify-center gap-3 group">
                   <ThumbsUp size={22} className="group-hover:scale-110 transition-transform" />
                   HIRE CHARLES
                </button>
                <button className="px-8 py-5 bg-surface-mid hover:bg-surface-high border border-border-subtle text-foreground rounded-2xl font-black transition-all tracking-tight flex items-center justify-center gap-2">
                   <MessageSquare size={18} />
                   MESSAGE
                </button>
                <button className="px-8 py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-black transition-all tracking-tight flex items-center justify-center gap-2">
                   <XCircle size={18} />
                   REJECT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
