'use client';

import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext<{
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
}>({
  isHovered: false,
  setIsHovered: () => {},
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <SidebarContext.Provider value={{ isHovered, setIsHovered }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
