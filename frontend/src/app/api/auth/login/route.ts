import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const user = await res.json();

        if (!res.ok || !user) throw new Error("Invalid credentials");

        return user; // NextAuth stocke cet objet dans la session
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.pseudo = user.pseudo;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.pseudo = token.pseudo;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' as 'jwt' },
  pages: {
    signIn: "/login",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
