'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
  registeredRepos: string[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<Role>('contributor');
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [registeredRepos, setRegisteredRepos] = useState<string[]>([]);

  // Sync with Auth.js session and backend status
  useEffect(() => {
    async function syncUserStatus() {
      if (session?.user) {
        setGithubUser({
          login: (session.user as any).login || session.user.name || 'user',
          name: session.user.name || '',
          avatar_url: session.user.image || ''
        });

        // Fetch real role from backend
        try {
          const res = await fetch('/api/user/status');
          const data = await res.json();
          if (data.success) {
            setRole(data.role);
            setRegisteredRepos(data.repos || []);
          } else {
            setRole('contributor');
          }
        } catch (error) {
          console.error('Error syncing user status:', error);
          setRole('contributor');
        }
      } else {
        setGithubUser(null);
        setRole('contributor');
        setRegisteredRepos([]);
      }
    }
    
    if (status !== 'loading') {
      syncUserStatus();
    }
  }, [session, status]);

  return (
    <RoleContext.Provider value={{ 
      role, 
      setRole, 
      githubUser, 
      setGithubUser, 
      selectedRepo, 
      setSelectedRepo,
      registeredRepos
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
