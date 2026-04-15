'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useRole } from '@/components/providers/role-context';
import { BalanceDisplay } from '@/components/ui/BalanceDisplay';
import { 
  Search, 
  Bell, 
  Trophy, 
  Menu,
  X,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Boxes,
  Flag,
  Zap,
  Shield,
  Crown,
  BriefcaseBusiness,
  Calendar
} from 'lucide-react';
import Github from '@/components/ui/GithubIcon';
import Leaderboard from '@/components/ui/Leaderboard';

import { signIn, signOut } from 'next-auth/react';

export default function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = React.useState(false);
  const { role, setRole, githubUser } = useRole();

  return (
    <nav className="h-14 md:h-16 border-b border-border-subtle bg-surface-low/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative shrink-0 rounded-xl overflow-hidden bg-surface-high shadow-sm shadow-accent/10 border border-border-subtle hover:scale-105 transition-transform">
              <Image 
                src="/openhacks.png" 
                alt="OpenHacks Logo" 
                fill 
                sizes="32px"
                className="object-cover" 
              />
            </div>
            <span className="hidden sm:block text-sm font-black italic uppercase tracking-tighter text-foreground">OpenHacks</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-foreground">
          <span className="text-sm font-black uppercase tracking-tight text-accent">
            {role === 'contributor' ? 'Contributor' : 'Maintainer'}
          </span>
          <span className="text-muted-foreground/30">/</span>
          <span className="text-sm font-semibold tracking-tight uppercase text-xs">Dashboard</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative group hidden lg:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-surface-mid border border-border-subtle rounded-full py-2 pl-9 pr-4 text-sm w-32 md:w-48 focus:outline-none focus:border-accent/50 focus:bg-surface-low transition-all text-foreground"
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 text-muted-foreground">
          <button className="p-2 hover:text-foreground hover:bg-surface-high rounded-lg transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-surface-low"></span>
          </button>
          
          {role === 'maintainer' && <BalanceDisplay />}
          
          <ThemeToggle />
          
          {role === 'contributor' && (
            <button 
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full font-bold text-xs ring-1 ring-accent/20 hover:bg-accent/20 transition-all group overflow-hidden"
            >
              <Trophy size={14} className="group-hover:rotate-12 transition-transform" />
              <span>{(githubUser as any)?.reputation || 0}</span>
            </button>
          )}

          {githubUser && (
            <div className="relative flex items-center bg-surface-high/50 backdrop-blur-sm p-1 rounded-2xl border border-border-subtle overflow-hidden ml-2">
              <div 
                className={`absolute top-1 bottom-1 w-9 bg-accent rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg shadow-accent/20 ${
                  role === 'contributor' ? 'left-1' : 'left-[41px]'
                }`}
              />
              
              <button 
                onClick={() => setRole('contributor')}
                className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-300 ${
                  role === 'contributor' ? 'text-white dark:text-black' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Contributor Mode"
              >
                <User size={18} strokeWidth={2.5} />
              </button>
              
              <button 
                onClick={() => setRole('maintainer')}
                className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-300 ${
                  role === 'maintainer' ? 'text-white dark:text-black' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Owner Mode"
              >
                <Crown size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {!githubUser ? (
            <button 
              onClick={() => signIn('github')}
              className="px-4 py-2 bg-foreground text-background rounded-xl font-black text-xs transition-all hover:scale-105 active:scale-95 ml-2 flex items-center gap-2"
            >
              <Github size={14} />
              SIGN IN
            </button>
          ) : (
            <div className="relative group ml-4 pl-4 border-l border-border-subtle">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 cursor-pointer outline-none"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-accent/20 ring-2 ring-transparent group-hover:ring-accent/20 transition-all">
                  <img src={githubUser.avatar_url} alt={githubUser.login} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground hidden lg:block group-hover:text-accent transition-colors">
                  {githubUser.login}
                </span>
              </button>

              {/* Desktop Profile Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-low border border-border-subtle rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-1 group-hover:translate-y-0">
                <div className="px-4 py-2 border-b border-border-subtle mb-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Signed in as</p>
                  <p className="text-xs font-bold text-foreground truncate">{githubUser.login}</p>
                </div>
                
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-high transition-colors">
                  <User size={14} />
                  My Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-high transition-colors">
                  <Settings size={14} />
                  Settings
                </Link>
                
                <hr className="my-1 border-border-subtle" />
                
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
    </nav>
  );
}

const MobileMenuItem = ({ icon, label, href, onClick }: { icon: React.ReactNode, label: string, href: string, onClick: () => void }) => (
  <a 
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 hover:bg-surface-high rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-95"
  >
    {icon}
    <span className="text-sm font-black uppercase tracking-tight">{label}</span>
  </a>
);
