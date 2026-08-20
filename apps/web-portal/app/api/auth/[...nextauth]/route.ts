import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode } from "jwt-decode";

const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "bankcore-web",
      clientSecret: process.env.KEYCLOAK_SECRET || "bankcore-web-secret",
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          prompt: "login",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        
        try {
          // Check for custom roles claim mapping or default realm_access
          const decoded = jwtDecode<{ roles?: string[], realm_access?: { roles: string[] } }>(account.access_token as string);
          token.roles = decoded.roles || decoded.realm_access?.roles || [];
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      const customSession = session as typeof session & { accessToken?: string; roles?: string[] };
      const customToken = token as typeof token & { accessToken?: string; roles?: string[] };
      customSession.accessToken = customToken.accessToken;
      customSession.roles = customToken.roles || [];
      return customSession;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
