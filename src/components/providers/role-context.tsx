'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type Role = 'contributor' | 'maintainer';

interface GithubUser {
  id?: string;
  login: string;
  name: string;
  avatar_url: string;
  reputation?: number;
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
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('openhacks_active_role') as Role;
    if (savedRole) {
      setRole(savedRole);
    }
    setHasLoadedInitial(true);
  }, []);

  // Update localStorage when role changes
  useEffect(() => {
    if (hasLoadedInitial) {
      localStorage.setItem('openhacks_active_role', role);
    }
  }, [role, hasLoadedInitial]);

  // Sync with Auth.js session and backend status
  useEffect(() => {
    async function syncUserStatus() {
      if (session?.user) {
        setGithubUser({
          id: (session.user as any).id,
          login: (session.user as any).login || session.user.name || 'user',
          name: session.user.name || '',
          avatar_url: session.user.image || '',
          reputation: (session.user as any).reputation || 0
        });

        // Fetch real role from backend to see if they ARE a maintainer
        try {
          const res = await fetch('/api/user/status');
          const data = await res.json();
          if (data.success) {
            setRegisteredRepos(data.repos || []);
            // Update reputation if backend has more recent data
            if (data.reputation !== undefined) {
              setGithubUser(prev => prev ? { ...prev, reputation: data.reputation } : null);
            }
            // Only force 'maintainer' if they have repos AND no role was saved yet
            const savedRole = localStorage.getItem('openhacks_active_role');
            if (data.role === 'maintainer' && !savedRole) {
              setRole('maintainer');
            }
          }
        } catch (error) {
          console.error('Error syncing user status:', error);
        }
      } else {
        setGithubUser(null);
        setRole('contributor');
        setRegisteredRepos([]);
      }
    }
    
    if (status !== 'loading' && hasLoadedInitial) {
      syncUserStatus();
    }
  }, [session, status, hasLoadedInitial]);

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
