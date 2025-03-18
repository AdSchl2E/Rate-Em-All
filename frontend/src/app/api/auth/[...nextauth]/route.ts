import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Trying to login with:", credentials);

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
              name: user.name,
              email: user.email, 
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
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
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
        name: token.name as string,
        email: token.email as string,
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
});

export { handler as GET, handler as POST };
