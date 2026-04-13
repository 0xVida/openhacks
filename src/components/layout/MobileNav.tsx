'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Boxes, 
  UserCircle, 
  Settings,
  Circle
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const NavItem = ({ icon, label, href }: NavItemProps) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center gap-1 flex-1 relative py-2 transition-all active:scale-95 ${
        active ? 'text-accent' : 'text-muted-foreground'
      }`}
    >
      {active && (
        <div className="absolute top-0 w-8 h-1 bg-accent rounded-full animate-in fade-in slide-in-from-top-1 duration-300" />
      )}
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
    </Link>
  );
};

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-low/80 backdrop-blur-xl border-t border-border-subtle z-[100] px-4 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center justify-around">
      <NavItem icon={<LayoutDashboard size={20} strokeWidth={2} />} label="Home" href="/" />
      <NavItem icon={<Boxes size={20} strokeWidth={2} />} label="Explore" href="/projects" />
      <NavItem icon={<UserCircle size={20} strokeWidth={2} />} label="Profile" href="/profile" />
      <NavItem icon={<Settings size={20} strokeWidth={2} />} label="Settings" href="/settings" />
    </nav>
  );
}
