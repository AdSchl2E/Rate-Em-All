/**
 * Types pour l'API Rate-Em-All
 */

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  noCache?: boolean;
  cache?: RequestCache;
}

export interface RegisterUserData {
  pseudo: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    pseudo: string;
  };
  accessToken: string;
}

export interface PokemonRatingData {
  rating: number;
  numberOfVotes: number;
  userRating?: number;
}

export interface UserRatingEntry {
  pokemonId: number;
  rating: number;
}

export interface UserRatingsResponse {
  ratings: UserRatingEntry[];
}

export interface PokemonListResponse {
  pokemons: any[];
  hasMore: boolean;
  total: number;
}
