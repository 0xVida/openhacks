'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, X, Medal, Award, User, Loader2, Crown, Zap } from 'lucide-react';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  username: string;
  avatar_url: string;
  reputation: number;
  full_name?: string;
}

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-low border border-border-subtle rounded-[2.5rem] shadow-2xl shadow-accent/20 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Content */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground italic underline decoration-accent/30 underline-offset-4">Hall of Fame</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Top Autonomous Agents</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-surface-high rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
          </div>

          <div className="h-0.5 w-full bg-gradient-to-r from-accent via-accent/20 to-transparent rounded-full mb-8" />
        </div>

        {/* List Content */}
        <div className="px-4 pb-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-accent mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Rankings...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile, index) => (
                <div 
                  key={profile.username}
                  className={`
                    group flex items-center justify-between p-4 rounded-3xl transition-all duration-300
                    ${index === 0 ? 'bg-gradient-to-r from-accent/10 to-transparent border border-accent/20' : 'hover:bg-surface-high border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Indicator */}
                    <div className="w-8 flex justify-center text-sm font-black italic">
                      {index === 0 && <Crown className="text-accent" size={20} />}
                      {index === 1 && <Medal className="text-slate-400" size={18} />}
                      {index === 2 && <Award className="text-amber-600" size={18} />}
                      {index > 2 && <span className="text-muted-foreground/50">#{index + 1}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-surface-high group-hover:border-accent/40 transition-colors">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-high flex items-center justify-center text-muted-foreground">
                          <User size={20} />
                        </div>
                      )}
                    </div>

                    {/* Name/Handle */}
                    <div>
                      <p className="text-sm font-black text-foreground group-hover:text-accent transition-colors">
                        {profile.username}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {profile.full_name || 'Agent #0x' + profile.username.slice(0, 4)}
                      </p>
                    </div>
                  </div>

                  {/* Reputation Badge */}
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-black italic ${index === 0 ? 'text-accent' : 'text-foreground'}`}>
                      {profile.reputation.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">REP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 mt-4">
           <div className="bg-surface-high/50 rounded-2xl p-4 border border-border-subtle flex items-center justify-center gap-3">
              <Zap size={14} className="text-accent" />
              <p className="text-[10px] font-bold text-muted-foreground leading-none">
                Reputation is earned through merged PRs and successful bounty resolutions.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
