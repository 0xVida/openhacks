'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/providers/sidebar-context';
import { useRole } from '@/components/providers/role-context';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Boxes, 
  Flag, 
  Zap, 
  Settings2, 
  UserCircle,
  BriefcaseBusiness,
  Calendar,
  Crown
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const SidebarItem = ({ icon, label, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 cursor-pointer w-full 
        ${active 
          ? 'bg-sidebar-accent shadow-xl shadow-sidebar-accent/30 text-white dark:text-black font-black' 
          : 'text-foreground hover:bg-surface-high'}`}
    >
      <div className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-80 group-hover:opacity-100'}`}>
        {icon}
      </div>
      <span className="text-sm font-black opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-tighter uppercase relative z-10">
        {label}
      </span>
    </Link>
  );
};

export default function Sidebar() {
  const { setIsHovered } = useSidebar();
  const { role } = useRole();

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden md:flex w-20 hover:w-64 transition-all duration-500 h-screen border-r border-border-subtle flex-col items-start py-8 px-4 bg-surface-low fixed left-0 top-0 z-[100] overflow-hidden group/sidebar shadow-2xl"
    >
      <Link href="/" className="flex items-center gap-4 mb-14 pl-1 shrink-0">
        <div className="w-12 h-12 relative flex items-center justify-center shadow-xl shadow-sidebar-accent/30 rotate-[-8deg] group-hover/sidebar:rotate-0 transition-transform duration-500 rounded-2xl overflow-hidden bg-surface-high">
          <Image 
            src="/openhacks.png" 
            alt="OpenHacks Logo" 
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>
        <span className="font-black text-2xl text-foreground opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 tracking-tighter italic uppercase whitespace-nowrap">
          OpenHacks
        </span>
      </Link>
      
      <div className="flex flex-col gap-3 w-full flex-1">
        <SidebarItem icon={<LayoutDashboard size={24} strokeWidth={1.8} />} label="Dashboard" href="/" />
        <SidebarItem icon={<Boxes size={24} strokeWidth={1.8} />} label="Projects" href="/projects" />
        
        {role === 'contributor' ? (
          <>
            <SidebarItem icon={<Calendar size={24} strokeWidth={1.8} />} label="My Tasks" href="/timeline" />
          </>
        ) : (
          <>
            <SidebarItem icon={<BriefcaseBusiness size={24} strokeWidth={1.8} />} label="Bounties" href="/quests" />
            <SidebarItem icon={<Zap size={24} strokeWidth={1.8} />} label="Submissions" href="/timeline" />
          </>
        )}
      </div>
      
      <div className="mt-auto w-full flex flex-col gap-3 pt-8 border-t border-border-subtle">
        {role === 'maintainer' && (
           <div className="mb-4 px-3 py-2 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
              <Crown size={18} className="text-accent" />
              <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none">Admin Mode</span>
           </div>
        )}
        <SidebarItem icon={<Settings2 size={24} strokeWidth={1.8} />} label="Settings" href="/settings" />
        <SidebarItem icon={<UserCircle size={24} strokeWidth={1.8} />} label="Profile" href="/profile" />
      </div>
    </aside>
  );
}
