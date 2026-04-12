'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import Github from '@/components/ui/GithubIcon';
import { useRole } from '@/components/providers/role-context';
import RootContainer from '@/components/layout/RootContainer';

export default function OnboardingPage() {
  const router = useRouter();
  const { setGithubUser, setRole } = useRole();

  const handleGithubLogin = () => {
    // Mock GitHub Login
    setGithubUser({
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4'
    });
    setRole('maintainer');
    router.push('/maintainer/setup');
  };

  return (
    <RootContainer>
      <div className="flex-1 bg-surface-low overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-accent/10 text-accent mb-6 shadow-xl shadow-accent/20 border border-accent/20">
              <Github size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight mb-4">Connect GitHub</h1>
            <p className="text-muted-foreground text-lg font-medium">Link your account to start managing bounties and automating your open source workflow.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-12">
            <FeatureItem 
              icon={<ShieldCheck className="text-green-500" size={20} />} 
              title="Secure Integration" 
              description="OpenHacks uses GitHub Apps to securely interact with your repositories." 
            />
            <FeatureItem 
              icon={<Zap className="text-accent" size={20} />} 
              title="Automated Payouts" 
              description="Bounties are automatically paid out when PRs are merged." 
            />
            <FeatureItem 
              icon={<Globe className="text-blue-500" size={20} />} 
              title="Public Recognition" 
              description="Build your reputation as a top-tier maintainer or contributor." 
            />
          </div>

          <button 
            onClick={handleGithubLogin}
            className="w-full py-6 bg-foreground text-background rounded-3xl font-black text-xl transition-all shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 group"
          >
            <Github size={24} />
            CONTINUE WITH GITHUB
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="text-center text-xs text-muted-foreground mt-8 uppercase tracking-widest font-black opacity-50">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </RootContainer>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-surface-mid border border-border-subtle rounded-2xl transition-all hover:border-accent/30">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
