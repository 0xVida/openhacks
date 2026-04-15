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
      if (user) {
        token.id = uuidv5(user.id.toString(), GITHUB_NAMESPACE);
        token.login = user.login || user.name;
        token.name = user.name;
        token.picture = user.image;
        token.email = user.email;
      }
      if (account) {
        token.accessToken = account.access_token;
      }

      if (trigger === "signIn" && account?.provider === "github" && account.access_token) {
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
            } else {
              token.email = emails.find((e: any) => e.verified)?.email || emails[0]?.email || token.email;
            }
          }
        } catch (e: any) {
          // Silent catch
        }

        if (token.id && token.email) {
          try {
            const username = token.login;
            const supabaseId = token.id;

            const { data: existingById } = await supabaseAdmin.from('profiles').select('id').eq('id', supabaseId).maybeSingle();
            
            if (existingById) {
              await supabaseAdmin.from('profiles').update({ 
                email: token.email, 
                avatar_url: token.picture,
                full_name: token.name,
                updated_at: new Date().toISOString() 
              }).eq('id', supabaseId);
            } else {
              const { data: existingByName } = await supabaseAdmin.from('profiles').select('id').eq('username', username).maybeSingle();

              if (existingByName) {
                const { error: migrationError } = await supabaseAdmin
                  .from('profiles')
                  .update({ id: supabaseId })
                  .eq('id', existingByName.id);

                if (!migrationError) {
                  await supabaseAdmin.from('profiles').update({
                    email: token.email,
                    avatar_url: token.picture,
                    full_name: token.name,
                    updated_at: new Date().toISOString()
                  }).eq('id', supabaseId);
                }
              } else {
                await supabaseAdmin.from('profiles').insert({
                  id: supabaseId,
                  username,
                  email: token.email,
                  avatar_url: token.picture,
                  full_name: token.name,
                  role: 'maintainer'
                });
              }
            }
          } catch (err: any) {
             // Silent catch
          }
        }
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
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
          // Silent catch
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
