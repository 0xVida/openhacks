'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Code2, ArrowRight, Loader2, MessageSquare, Zap } from 'lucide-react';
import Link from 'next/link';
import Github from '@/components/ui/GithubIcon';

interface Project {
  name: string;
  fullName: string;
  count: number;
  description: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveProjects() {
      try {
        const response = await fetch('/api/bounties');
        const result = await response.json();
        if (result.success) {
          // Group by repo
          const repoMap: Record<string, Project> = {};
          result.data.forEach((b: any) => {
            if (!repoMap[b.repo]) {
              repoMap[b.repo] = {
                name: b.repo.split('/')[1] || b.repo,
                fullName: b.repo,
                count: 0,
                description: 'Active open-source repository on GitHub.'
              };
            }
            repoMap[b.repo].count++;
          });
          setProjects(Object.values(repoMap));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchActiveProjects();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-surface-low">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
         <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent font-black text-[10px] uppercase tracking-widest mb-6">
               <Layers size={14} />
               <span>Ecosystem Health</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tighter italic uppercase">Active Projects</h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium tracking-tight">Repositories currently hosting live technical challenges and rewards.</p>
         </header>

         {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-50">
               <Loader2 className="animate-spin text-accent mb-4" size={40} />
               <p className="text-xs font-black uppercase tracking-widest">Scanning Network...</p>
            </div>
         ) : projects.length === 0 ? (
            <div className="bg-surface-mid border border-border-subtle rounded-[2.5rem] p-16 text-center">
               <div className="w-20 h-20 bg-surface-high rounded-3xl flex items-center justify-center mx-auto mb-8 text-muted-foreground/30 border border-border-subtle">
                  <Zap size={40} />
               </div>
               <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">No Active Repo Signals</h3>
               <p className="text-muted-foreground font-medium mb-8">Maintainers haven't launched any bounties yet.</p>
               <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                  Return to Dashboard
               </Link>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {projects.map(project => (
                  <div key={project.fullName} className="group relative flex flex-col bg-surface-mid border border-border-subtle rounded-[2.5rem] p-8 hover:bg-surface-high transition-all duration-500 hover:-translate-y-2">
                     <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-surface-high border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-accent transition-colors">
                        <Github size={24} />
                     </div>
                     
                     <div className="flex-1 mt-4">
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-accent transition-colors">{project.name}</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-6">{project.fullName}</p>
                        
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-border-subtle">
                              <div className="flex items-center gap-3">
                                 <MessageSquare size={16} className="text-accent" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Active Bounties</span>
                              </div>
                              <span className="text-sm font-black text-accent">{project.count}</span>
                           </div>
                        </div>
                     </div>
                     
                     <Link 
                        href="/"
                        className="mt-8 py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-white transition-all shadow-xl shadow-black/5"
                     >
                        Browse Issues
                        <ArrowRight size={14} />
                     </Link>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
