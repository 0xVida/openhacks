import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { supabaseAdmin } from "@/lib/supabase";
import { v5 as uuidv5 } from 'uuid';

// Deterministic namespace for GitHub IDs -> UUIDs
const GITHUB_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Using DNS namespace as base

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, trigger }: any) {
      const debugLogs: string[] = [];
      const log = (msg: string) => {
        const timestamped = `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`;
        console.log(timestamped);
        debugLogs.push(timestamped);
      };

      if (trigger === "signIn" && account?.provider === "github") {
        log(`[AUTH] Starting sign-in trigger for ${token.name || token.login}`);
        
        if (account.access_token) {
          try {
            log(`[AUTH] Fetching primary email from GitHub...`);
            const emailRes = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
                "Accept": "application/vnd.github.v3+json",
              },
            });

            if (emailRes.ok) {
              const emails = await emailRes.json();
              log(`[AUTH] Found ${emails.length} total GitHub emails`);
              
              const primaryEmail = emails.find((e: any) => e.primary && e.verified);
              if (primaryEmail) {
                token.email = primaryEmail.email;
                log(`[AUTH] SUCCESS: Primary verified email found: ${token.email}`);
              } else {
                const fallback = emails.find((e: any) => e.verified)?.email || emails[0]?.email;
                token.email = fallback;
                log(`[AUTH] WARNING: No primary verified found. Falling back to: ${token.email}`);
              }
            } else {
              log(`[AUTH] ERROR: GitHub Email API returned status ${emailRes.status}`);
            }
          } catch (e: any) {
            log(`[AUTH] CRITICAL ERROR: ${e.message}`);
          }
        } else {
          log(`[AUTH] ERROR: No access token found in account object`);
        }

        // Trigger database sync
        if (token.email) {
          try {
            const username = token.login || token.name;
            const supabaseId = uuidv5(token.id as string, GITHUB_NAMESPACE);
            log(`[AUTH] Syncing to Supabase (User: ${username}, Email: ${token.email})`);

            const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('id', supabaseId).maybeSingle();
            
            if (existing) {
              await supabaseAdmin.from('profiles').update({ 
                email: token.email, 
                avatar_url: token.picture,
                full_name: token.name,
                updated_at: new Date().toISOString() 
              }).eq('id', supabaseId);
              log(`[AUTH] Profile updated in DB`);
            } else {
              await supabaseAdmin.from('profiles').insert({
                id: supabaseId,
                username,
                email: token.email,
                avatar_url: token.picture,
                full_name: token.name,
                role: 'contributor'
              });
              log(`[AUTH] New profile created in DB`);
            }
          } catch (err: any) {
            log(`[AUTH] DB SYNC ERROR: ${err.message}`);
          }
        }
      }

      if (user) {
        token.id = user.id;
        token.login = user.login || (user as any)?.name;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      
      // Persist logs to token so session can see them
      if (debugLogs.length > 0) {
        token.debugLogs = debugLogs;
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      if (token.debugLogs) {
        (session as any).debugLogs = token.debugLogs;
      }
      
      if (session.user) {
        (session.user as any).login = token.login;
        (session.user as any).id = token.id;

        // Fetch the REAL Supabase statistics for this profile
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('reputation')
            .eq('id', token.id)
            .single();

          if (profile) {
            (session.user as any).reputation = profile.reputation;
          }
        } catch (e) {
          console.error("Session profile sync error:", e);
        }
      }
      return session;
    },
  },
});

export async function getRequestIdentity(request?: Request) {
  const session = await auth();
  if (session?.user) {
    return {
      type: 'human' as const,
      user: session.user as { id: string; login: string; reputation: number; name?: string; email?: string }
    };
  }

  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '');
      const { db } = await import('@/lib/db');
      const profile = await db.getProfileByApiKey(apiKey);

      if (profile) {
        return {
          type: 'agent' as const,
          user: {
            id: profile.id,
            login: profile.username,
            reputation: profile.reputation,
            name: profile.full_name,
          }
        };
      }
    }
  }

  return null;
}
