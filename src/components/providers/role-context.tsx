'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'contributor' | 'maintainer';

interface GithubUser {
  login: string;
  name: string;
  avatar_url: string;
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  githubUser: GithubUser | null;
  setGithubUser: (user: GithubUser | null) => void;
  selectedRepo: string | null;
  setSelectedRepo: (repo: string | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('contributor');
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  // Auto-login for maintainer demo purposes if you want, but better to keep it manual per plan
  
  return (
    <RoleContext.Provider value={{ 
      role, 
      setRole, 
      githubUser, 
      setGithubUser, 
      selectedRepo, 
      setSelectedRepo 
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
