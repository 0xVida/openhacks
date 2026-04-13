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
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.id = user.id;
        token.login = user.login || (profile as any)?.login;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      if (session.user) {
        const login = token.login || (session.user as any).login || session.user.name;
        (session.user as any).login = login;
        
        // Fetch the REAL Supabase UUID for this profile
        try {
          const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, reputation')
            .eq('username', login)
            .single();
          
          if (profile) {
            (session.user as any).id = profile.id; // Map to Supabase UUID
            (session.user as any).reputation = profile.reputation;
          } else {
             console.warn(`No profile found for login: ${login}`);
          }
        } catch (e) {
          console.error("Session profile sync error:", e);
        }
      }
      return session;
    },
    async signIn({ user, account, profile: githubProfile }: any) {
      if (account?.provider === "github") {
        const username = githubProfile.login;
        const avatar_url = githubProfile.avatar_url;
        const full_name = githubProfile.name;
        
        // Generate a valid UUID from the numeric GitHub ID
        const supabaseId = uuidv5(user.id, GITHUB_NAMESPACE);

        try {
          // Check if profile exists by username (legacy sync) or supabaseId
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .or(`username.eq.${username},id.eq.${supabaseId}`)
            .maybeSingle();

          if (existingProfile) {
            // Update existing
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                avatar_url,
                full_name,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProfile.id);
            
            if (updateError) console.error("Error updating profile:", updateError);
          } else {
            // Create new
            const { error: insertError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: supabaseId,
                username,
                email: user.email,
                avatar_url,
                full_name,
                role: 'contributor'
              });
            
            if (insertError) {
               console.error("CRITICAL: Error creating profile in Supabase. Check if you dropped the fkey constraint as requested:", insertError);
            }
          }
        } catch (e) {
          console.error("SignIn profile sync error:", e);
        }
      }
      return true;
    },
  },
});
