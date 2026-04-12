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

export default function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { role, setRole, githubUser } = useRole();

  return (
    <nav className="h-16 border-b border-border-subtle bg-surface-low/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-surface-high rounded-lg transition-colors text-foreground"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        
        <div className="md:hidden w-8 h-8 relative shrink-0 rounded-xl overflow-hidden bg-surface-high shadow-sm shadow-accent/10">
          <Image 
            src="/openhacks.png" 
            alt="OpenHacks Logo" 
            fill 
            sizes="32px"
            className="object-cover" 
          />
        </div>

        <div className="hidden sm:flex items-center gap-2 text-foreground">
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
            <div className="hidden sm:flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full font-bold text-xs ring-1 ring-accent/20">
              <Trophy size={14} />
              <span>1,400</span>
            </div>
          )}


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

          {!githubUser && role === 'maintainer' && (
            <Link 
              href="/onboarding"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl font-black text-xs transition-all hover:scale-105 active:scale-95 ml-2"
            >
              <Github size={14} />
              CONNECT GITHUB
            </Link>
          )}

          {githubUser && (
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-border-subtle">
               <div className="w-8 h-8 rounded-lg overflow-hidden border border-accent/20">
                  <img src={githubUser.avatar_url} alt={githubUser.login} className="w-full h-full object-cover" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground hidden lg:block">
                  {githubUser.login}
               </span>
            </div>
          )}
        </div>
      </div>


      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-surface-low border-b border-border-subtle p-4 md:hidden animate-in slide-in-from-top-2 duration-200 z-50 overflow-y-auto max-h-[calc(100vh-4rem)] shadow-2xl">
          <div className="flex flex-col gap-1">
            {role === 'contributor' && (
              <div className="flex items-center justify-between p-4 mb-2 bg-accent/5 rounded-2xl border border-accent/10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                       <Trophy size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">My Points</p>
                       <p className="text-xl font-black text-foreground">1,400</p>
                    </div>
                 </div>
                 <div className="px-3 py-1 bg-accent text-white rounded-lg text-[10px] font-black uppercase tracking-tight">
                    Top 5%
                 </div>
              </div>
            )}

            <MobileMenuItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/" onClick={() => setIsMenuOpen(false)} />
            <MobileMenuItem icon={<Boxes size={18} />} label="Projects" href="/projects" onClick={() => setIsMenuOpen(false)} />
            {role === 'contributor' ? (
              <>
                <MobileMenuItem icon={<Calendar size={18} />} label="My Tasks" href="/timeline" onClick={() => setIsMenuOpen(false)} />
              </>
            ) : (
              <>
                <MobileMenuItem icon={<Zap size={18} />} label="Submissions" href="/timeline" onClick={() => setIsMenuOpen(false)} />
              </>
            )}
            
            <hr className="my-2 border-border-subtle" />
            
            <MobileMenuItem icon={<User size={18} />} label="My Profile" href="/profile" onClick={() => setIsMenuOpen(false)} />
            <MobileMenuItem icon={<Settings size={18} />} label="Settings" href="/settings" onClick={() => setIsMenuOpen(false)} />
            <MobileMenuItem icon={<LogOut size={18} />} label="Sign Out" href="/" onClick={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
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
