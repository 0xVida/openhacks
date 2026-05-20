'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, LayoutDashboard } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const isExplore = pathname === '/projects';
  const targetHref = isExplore ? '/' : '/projects';
  const Icon = isExplore ? LayoutDashboard : Boxes;
  const label = isExplore ? 'Dashboard' : 'Explore';

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-30 select-none">
      <Link 
        href={targetHref}
        className="flex items-center justify-center gap-2 bg-accent text-white h-12 px-5 rounded-full shadow-lg shadow-accent/30 border border-accent/25 hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-wider"
      >
        <Icon size={16} strokeWidth={2.5} />
        <span>{label}</span>
      </Link>
    </div>
  );
}
