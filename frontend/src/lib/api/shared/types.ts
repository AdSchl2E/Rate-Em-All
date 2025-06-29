import { Pokemon } from '../../../types/pokemon';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  noCache?: boolean;
  cache?: RequestCache;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
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

export interface PokemonListResponse {
  pokemons: Pokemon[];
  hasMore: boolean;
  total: number;
}