import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { supabaseAdmin } from "@/lib/supabase";

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
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        const login = token.login || (session.user as any).login || session.user.name;
        (session.user as any).login = login;
        
        // Fetch the REAL Supabase UUID for this profile
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, reputation')
            .eq('username', login)
            .single();
          
          if (profile) {
            (session.user as any).id = profile.id; // Map to Supabase UUID
            (session.user as any).reputation = profile.reputation;
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

        try {
          // Check if profile exists by username
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

          if (existingProfile) {
            // Update existing
            await supabaseAdmin
              .from('profiles')
              .update({
                avatar_url,
                full_name,
                updated_at: new Date().toISOString()
              })
              .eq('username', username);
          } else {
            // Create new - Note: If id references auth.users and is UUID, 
            // and we don't have a supabase auth user, this might fail.
            // We use gen_random_uuid() if the ID field allows it, 
            // or we omit it if it's auto-generated.
            const { error: insertError } = await supabaseAdmin
              .from('profiles')
              .insert({
                username,
                email: user.email,
                avatar_url,
                full_name,
                role: 'contributor'
              });
            
            if (insertError) {
               console.error("Error creating profile:", insertError);
               // If it fails because of the auth.users FK, we can't do much without a schema change
               // but we'll log it clearly for the user.
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
