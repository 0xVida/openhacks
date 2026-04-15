import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { supabaseAdmin } from "@/lib/supabase";
import { v5 as uuidv5 } from 'uuid';

const GITHUB_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

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

      if (user) {
        token.id = uuidv5(user.id.toString(), GITHUB_NAMESPACE);
        token.login = user.login || user.name;
        token.name = user.name;
        token.picture = user.image;
        token.email = user.email;
        log(`[AUTH] Mapping identity: GitHub(${user.id}) -> UUID(${token.id})`);
      }
      if (account) {
        token.accessToken = account.access_token;
      }

      // 2. Metadata & Email Sync (Only on first sign-in)
      if (trigger === "signIn" && account?.provider === "github" && account.access_token) {
        log(`[AUTH] Starting sync for ${token.login}`);
        try {
          const emailRes = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "OpenHacks-Auth-Sync"
            },
          });

          if (emailRes.ok) {
            const emails = await emailRes.json();
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            if (primaryEmail) {
              token.email = primaryEmail.email;
              log(`[AUTH] SUCCESS: Found primary verified email: ${token.email}`);
            } else {
              token.email = emails.find((e: any) => e.verified)?.email || emails[0]?.email || token.email;
              log(`[AUTH] WARNING: Using fallback email: ${token.email}`);
            }
          }
        } catch (e: any) {
          log(`[AUTH] Email fetch error: ${e.message}`);
        }

        if (token.id && token.email) {
          try {
            const username = token.login;
            const supabaseId = token.id;

            const { data: existingById } = await supabaseAdmin.from('profiles').select('id').eq('id', supabaseId).maybeSingle();

            if (existingById) {
              log(`[AUTH] Identity match found. Updating profile data.`);
              await supabaseAdmin.from('profiles').update({
                email: token.email,
                avatar_url: token.picture,
                full_name: token.name,
                updated_at: new Date().toISOString()
              }).eq('id', supabaseId);
              log(`[AUTH] SUCCESS: Profile updated`);
            } else {
              // Check if the USERNAME exists under a DIFFERENT ID (Identity Conflict)
              const { data: existingByName } = await supabaseAdmin.from('profiles').select('id').eq('username', username).maybeSingle();

              if (existingByName) {
                log(`[AUTH] ATOMIC MIGRATION: Moving username ${username} from ${existingByName.id} -> ${supabaseId}`);

                const { error: migrationError } = await supabaseAdmin
                  .from('profiles')
                  .update({ id: supabaseId })
                  .eq('id', existingByName.id);

                if (migrationError) {
                  log(`[AUTH] MIGRATION FAILED: ${migrationError.message}. Check if ON UPDATE CASCADE is enabled.`);
                } else {
                  log(`[AUTH] SUCCESS: Identity migrated. Now syncing latest metadata.`);
                  await supabaseAdmin.from('profiles').update({
                    email: token.email,
                    avatar_url: token.picture,
                    full_name: token.name,
                    updated_at: new Date().toISOString()
                  }).eq('id', supabaseId);
                  log(`[AUTH] SUCCESS: Profile fully re-synchronized`);
                }
              } else {
                const { error } = await supabaseAdmin.from('profiles').insert({
                  id: supabaseId,
                  username,
                  email: token.email,
                  avatar_url: token.picture,
                  full_name: token.name,
                  role: 'maintainer'
                });
                if (error) {
                  log(`[AUTH] INSERT ERROR: ${error.message}`);
                } else {
                  log(`[AUTH] SUCCESS: New profile created`);
                }
              }
            }
          } catch (err: any) {
            log(`[AUTH] DB sync critical error: ${err.message}`);
          }
        }
      }

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
          console.error("[AUTH] Session profile sync error:", e);
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
