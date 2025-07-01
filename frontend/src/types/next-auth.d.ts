import NextAuth from "next-auth";

/**
 * NextAuth type extensions
 * Extends the default NextAuth types to include custom user properties and session data
 */
declare module "next-auth" {
  /**
   * Session interface extension
   * Adds custom properties to the session object
   */
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

  /**
   * User interface extension
   * Defines the structure of the user object returned from authentication providers
   */
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
