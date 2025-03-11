import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      pseudo: string;
    };
  }

  interface User {
    id: string;
    email: string;
    pseudo: string;
    accessToken: string;
  }
}
