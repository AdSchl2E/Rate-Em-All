import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      pseudo: string;
      createdAt: string;
      updatedAt: string;
      ratedPokemons: number[];
      favoritePokemons: number[];
      image?: string;
    };
  }

  interface User {
    id: string;
    pseudo: string;
    createdAt: string;
    updatedAt: string;
    accessToken: string;
    ratedPokemons: number[];
    favoritePokemons: number[];
    image?: string;
  }
}
