'use client';

import React from 'react';
import { useSidebar } from '@/components/providers/sidebar-context';

export default function RootContainer({ children }: { children: React.ReactNode }) {
  const { isHovered } = useSidebar();

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-300 md:ml-20 ${isHovered ? 'content-blur shadow-2xl' : 'content-normal'}`}>
      {children}
    </div>
  );
}
