import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { supabase } from "@/lib/supabase";

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
    }),
  ],
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (session.user) {
        // Fetch profile from Supabase to add to session
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', (session.user as any).login || session.user.name)
            .single();
          
          if (profile) {
            (session.user as any).reputation = profile.reputation;
            (session.user as any).id = profile.id;
          }
        } catch (e) {
          console.error("Session profile sync error:", e);
        }
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "github") {
        const username = profile.login;
        const avatar_url = profile.avatar_url;
        const full_name = profile.name;

        try {
          // Upsert profile in Supabase
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id, // This comes from NextAuth's user object
              username,
              avatar_url,
              full_name,
              updated_at: new Date().toISOString()
            }, { onConflict: 'username' });
          
          if (error) console.error("Error upserting profile:", error);
        } catch (e) {
          console.error("SignIn profile sync error:", e);
        }
      }
      return true;
    },
  },
});
