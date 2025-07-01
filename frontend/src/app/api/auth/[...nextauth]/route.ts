import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_CONFIG } from "@/lib/api/shared/config";

// Extract config into an exportable constant
export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        pseudo: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Trying to login with:", credentials);

          const res = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          if (!res.ok) {
            throw new Error("Invalid credentials");
          }

          const user = await res.json();
          console.log("User received from backend:", user); // Debug

          if (user.accessToken) {
            return { 
              id: user.id, 
              pseudo: user.pseudo, 
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              ratedPokemons: user.ratedPokemons,
              favoritePokemons: user.favoritePokemons,
              accessToken: user.accessToken 
            };
          }
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    // Auto logout after 2 hours of inactivity
    maxAge: 2 * 60 * 60, // 2 hours in seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.pseudo = user.pseudo;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.ratedPokemons = user.ratedPokemons;
        token.favoritePokemons = user.favoritePokemons;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        pseudo: token.pseudo as string,
        createdAt: token.createdAt as string,
        updatedAt: token.updatedAt as string,
        ratedPokemons: token.ratedPokemons as number[],
        favoritePokemons: token.favoritePokemons as number[],
      };
      session.accessToken = token.accessToken as string;
      return session;
    }
  }
};

// Use exported config to create handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
