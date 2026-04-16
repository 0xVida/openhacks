import { supabase, supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  reputation: number;
  role: 'contributor' | 'maintainer';
  email?: string;
  api_key?: string;
  locus_wallet_address?: string;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  repo_fullname: string;
  issue_number: number;
  reward_amount: number;
  status: 'pending' | 'open' | 'processing' | 'merged' | 'paid';
  maintainer_id?: string;
  escrow_address?: string;
  funding_status?: 'unfunded' | 'funded';
  locus_session_id?: string;
  locus_webhook_secret?: string;
  locus_checkout_url?: string;
  funded_at?: string;
  created_at?: string;
  tags?: string[];
}

export const db = {
  async getProfile(username: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return null;
    return data;
  },

  async getProfileByApiKey(apiKey: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error) return null;
    return data;
  },

  async updateApiKey(id: string, apiKey: string | null) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ api_key: apiKey })
      .eq('id', id);

    if (error) console.error('Error updating API key:', error);
  },

  async updateReputation(username: string, amount: number) {
    const profile = await this.getProfile(username);
    if (!profile) return;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ reputation: (profile.reputation || 0) + amount })
      .eq('username', username);

    if (error) console.error('Error updating reputation:', error);
  },

  async upsertProfile(profile: Partial<Profile>): Promise<Profile | null> {
    if (!profile.username) return null;

    const existing = await this.getProfile(profile.username);

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          ...profile,
          // Don't overwrite existing API key if they have one
          api_key: existing.api_key || profile.api_key || uuidv4()
        })
        .eq('username', profile.username)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile during upsert:', error);
        return null;
      }
      return data;
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: uuidv4(),
          reputation: 0,
          api_key: uuidv4(),
          ...profile
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting profile during upsert:', error);
        return null;
      }
      return data;
    }
  },

  async getBounties(): Promise<Bounty[]> {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bounties:', error);
      return [];
    }
    return data || [];
  },

  async addBounty(bounty: Omit<Bounty, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .insert({
        ...bounty,
        id: uuidv4(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding bounty:', error);
      throw new Error(`DATABASE_REJECTION: ${error.message} - ${error.details}`);
    }

    // Reward maintainer with reputation
    if (bounty.maintainer_id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('username').eq('id', bounty.maintainer_id).single();
      if (profile) {
        await this.updateReputation(profile.username, 10);
      }
    }

    return data;
  },

  async updateBountyStatus(id: string, status: Bounty['status'], contributorGithub?: string) {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bounty status:', error);
      return null;
    }

    // If merged/paid, reward contributor with reputation
    if ((status === 'merged' || status === 'paid') && contributorGithub) {
      await this.updateReputation(contributorGithub, 50);
    }

    return data;
  },

  async getBounty(id: string): Promise<Bounty | null> {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async findBountyByIssue(repo: string, issueNumber: number): Promise<Bounty | null> {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .select('*')
      .eq('repo_fullname', repo)
      .eq('issue_number', issueNumber)
      .single();

    if (error) return null;
    return data;
  },

  async getBountyBySessionId(sessionId: string): Promise<Bounty | null> {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .select('*')
      .eq('locus_session_id', sessionId)
      .single();
    if (error) return null;
    return data;
  },

  async updateBounty(id: string, updates: Partial<Bounty>): Promise<Bounty | null> {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  },

  async getEscrowTotal(maintainerId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .select('reward_amount')
      .eq('maintainer_id', maintainerId)
      .eq('funding_status', 'funded')
      .not('status', 'eq', 'paid');

    if (error) {
      console.error('Error calculating escrow total:', error);
      return 0;
    }

    return (data || []).reduce((sum, b) => sum + Number(b.reward_amount), 0);
  }
};
