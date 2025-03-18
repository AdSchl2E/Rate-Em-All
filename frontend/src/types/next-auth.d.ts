import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      pseudo: string;
      createdAt: string;
      updatedAt: string;
      ratedPokemons: number[];
      favoritePokemons: number[];
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    pseudo: string;
    createdAt: string;
    updatedAt: string;
    accessToken: string;
    ratedPokemons: number[];
    favoritePokemons: number[];
  }
}
