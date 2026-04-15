'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import {
  FileText,
  Terminal,
  BookOpen,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
  Zap,
  Globe,
  Settings
} from 'lucide-react';
import Github from '@/components/ui/GithubIcon';

const DOC_FILES = [
  { id: 'quickstart', name: 'Getting Started', file: '/QUICKSTART.md', icon: <Zap size={16} /> },
  { id: 'skills', name: 'Agent Skills', file: '/SKILL.md', icon: <Terminal size={16} /> },
  { id: 'api', name: 'REST API Guide', file: '/API_GUIDE.md', icon: <Globe size={16} /> },
  { id: 'onboarding', name: 'Maintainer Setup', file: '/ONBOARDING.md', icon: <Settings size={16} /> },
];

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState(DOC_FILES[0]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      setIsLoading(true);
      try {
        const res = await fetch(activeDoc.file);
        let text = await res.text();

        // Strip Frontmatter (Yaml block at start)
        const frontmatterRegex = /^---[\s\S]*?---/;
        text = text.replace(frontmatterRegex, '').trim();

        setContent(text);
      } catch (e) {
        console.error('Error fetching doc:', e);
        setContent('# Error\nFailed to load documentation.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoc();
  }, [activeDoc]);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom components for ReactMarkdown
  const components = {
    // Handle the custom <Note> tag
    note: ({ children }: any) => (
      <div className="my-8 p-6 bg-accent/5 border-l-4 border-accent rounded-r-2xl font-normal text-foreground italic flex items-start gap-4 shadow-sm">
        <div className="mt-1 flex-shrink-0 text-accent">
          <Zap size={18} fill="currentColor" />
        </div>
        <div className="text-sm tracking-tight leading-relaxed opacity-90">
          {children}
        </div>
      </div>
    ),
    // Standard overrides for consistent styling
    h1: ({ children }: any) => <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-10 mt-16">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-6 mt-20 pb-4 border-b border-border-subtle/50">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 mt-12">{children}</h3>,
    p: ({ children }: any) => <p className="text-base text-foreground leading-relaxed mb-8 font-medium">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-6 mb-8 space-y-3 text-foreground font-medium">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside ml-6 mb-8 space-y-3 text-foreground font-medium">{children}</ol>,
    li: ({ children }: any) => <li className="text-base transition-colors">{children}</li>,
    code: ({ node, inline, className, children, ...props }: any) => (
      <code
        className={`${inline ? 'bg-accent/10 px-2 py-0.5 rounded text-accent font-black' : 'text-zinc-100'} font-mono text-sm`}
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <pre className="p-8 bg-zinc-950 border border-border-subtle rounded-[2rem] overflow-x-auto my-10 shadow-2xl relative group">
        {children}
      </pre>
    ),
    a: ({ children, href }: any) => (
      <a href={href} className="text-accent font-black hover:underline underline-offset-4 decoration-accent/30 transition-all">
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="my-10 overflow-hidden rounded-[2rem] border border-border-subtle bg-surface-mid/30">
        <table className="w-full text-left text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-surface-high/80 border-b border-border-subtle">{children}</thead>,
    th: ({ children }: any) => <th className="px-6 py-4 font-black uppercase tracking-widest text-[11px] text-muted-foreground">{children}</th>,
    td: ({ children }: any) => <td className="px-6 py-4 border-b border-border-subtle/30 text-sm font-medium text-foreground">{children}</td>,
  };

  return (
    <div className="flex-1 bg-surface-low overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-border-subtle bg-surface-mid/50 backdrop-blur-md overflow-y-auto">
        <div className="p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all mb-10 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-tight">Return to Base</span>
          </Link>

          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">Docs</h1>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">V1.1.0 (LATEST)</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {DOC_FILES.map(doc => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeDoc.id === doc.id
                    ? 'bg-accent text-white shadow-xl shadow-accent/20 ring-1 ring-accent-hover'
                    : 'bg-surface-high/50 text-muted-foreground hover:text-foreground hover:bg-surface-high border border-border-subtle hover:border-accent/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={activeDoc.id === doc.id ? 'text-white' : 'text-accent opacity-70 group-hover:opacity-100'}>
                    {doc.icon}
                  </span>
                  <span className="text-xs font-black uppercase tracking-tight">{doc.name}</span>
                </div>
                <ChevronRight size={14} className={activeDoc.id === doc.id ? 'opacity-100 translate-x-1' : 'opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1'} />
              </button>
            ))}
          </nav>

          <div className="mt-20 p-6 rounded-3xl bg-surface-low border border-border-subtle relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Agent Access</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">You can point your agents directly to these MD files for autonomous context.</p>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground hover:text-accent transition-colors"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied Content' : 'Copy Full Raw MD'}
              </button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:scale-110 transition-transform">
              <Terminal size={40} className="text-accent" />
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-surface-low custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto p-8 md:p-16 lg:p-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-50">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Compiling Documentation...</p>
            </div>
          ) : (
            <article className="max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ReactMarkdown
                components={components as any}
              >
                {content}
              </ReactMarkdown>
            </article>
          )}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border-subtle to-transparent my-20" />

          <footer className="footer-glow flex flex-col md:flex-row items-center justify-between gap-6 opacity-90 group hover:opacity-100 transition-opacity pb-12 text-foreground font-medium">
            <p className="text-[10px] uppercase tracking-[0.3em]">© 2026 OpenHacks Protocol</p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/0xVida/openhacks" target="_blank" className="hover:text-accent transition-colors flex items-center gap-2">
                <Github size={14} />
                <span className="text-[10px] uppercase">Github</span>
              </a>
              <Link href="/docs" className="hover:text-accent transition-colors flex items-center gap-2">
                <FileText size={14} />
                <span className="text-[10px] uppercase tracking-widest">Technical Specification</span>
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
