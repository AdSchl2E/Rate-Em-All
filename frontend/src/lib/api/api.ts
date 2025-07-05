/**
 * API Client simplifié pour Rate-Em-All
 * Gère tous les appels API vers le backend NestJS via les routes Next.js internes
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getSession } from 'next-auth/react';
import { serverPokeApiRequest } from './pokeapi';
import type {
  ApiOptions,
  RegisterUserData,
  AuthResponse,
  PokemonRatingData,
  UserRatingsResponse,
  PokemonListResponse
} from './types';

// Configuration API
const API_CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3001',
  nextUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
};

console.log('API_URL', process.env.API_URL);
console.log('NEXT_PUBLIC_URL', process.env.NEXT_PUBLIC_URL);

/**
 * Fonction de base pour les requêtes API côté client
 */
async function clientApiRequest<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  try {
    const {
      method = 'GET',
      body,
      params = {},
      headers = {},
      requiresAuth = false,
      noCache = false
    } = options;

    // Construction de l'URL avec paramètres
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    if (noCache) {
      queryParams.append('_t', Date.now().toString());
    }

    const queryString = queryParams.toString();
    const separator = path.includes('?') ? '&' : '?';
    const url = `/api${path}${queryString ? `${separator}${queryString}` : ''}`;

    // Préparation des headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Ajout de l'authentification si nécessaire
    if (requiresAuth) {
      const session = await getSession();
      if (session?.accessToken) {
        requestHeaders['Authorization'] = `Bearer ${session.accessToken}`;
      } else {
        throw new Error('Authentication required but no valid session found');
      }
    }

    // Configuration de la requête
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      cache: noCache ? 'no-store' : 'default',
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Exécution de la requête
    const response = await fetch(url, requestOptions);
    
    // Gestion du contenu
    let data;
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Gestion des erreurs
    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.error('[API Client] Request error:', error);
    throw error;
  }
}

/**
 * Fonction de base pour les requêtes API côté serveur
 */
export async function serverApiRequest<T = any>(
  path: string, 
  options: ApiOptions = {}
): Promise<T> {
  try {
    const {
      method = 'GET',
      body,
      params = {},
      headers: customHeaders = {},
      requiresAuth = false,
      noCache = false,
      cache = 'no-store'
    } = options;

    // Construction des paramètres de requête
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = `${API_CONFIG.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

    // Préparation des headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Configuration de la requête
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      next: { 
        revalidate: noCache ? 0 : undefined
      },
      cache
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Exécution de la requête
    const response = await fetch(url, requestOptions);
    
    // Gestion du contenu
    let data;
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Gestion des erreurs
    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.error('[Server API] Request error:', error);
    throw error;
  }
}

/**
 * API Client unifié - peut être utilisé côté client et serveur
 */
export const api = {
  // =============== AUTHENTIFICATION ===============
  auth: {
    /**
     * Inscription d'un nouvel utilisateur
     */
    async register(userData: RegisterUserData): Promise<AuthResponse> {
      return clientApiRequest('/auth/signup', {
        method: 'POST',
        body: userData
      });
    },

    /**
     * Obtenir le profil utilisateur actuel
     */
    async getProfile(token?: string): Promise<any> {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return clientApiRequest('/users', {
        headers,
        requiresAuth: !token,
        noCache: true
      });
    }
  },

  // =============== UTILISATEURS ===============
  user: {
    /**
     * Mettre à jour le profil utilisateur
     */
    async updateProfile(username: string): Promise<{ success: boolean; user: any }> {
      return clientApiRequest('/users?action=update-profile', {
        method: 'POST',
        body: { username },
        requiresAuth: true
      });
    },

    /**
     * Vérifier la disponibilité d'un nom d'utilisateur
     */
    async checkUsername(username: string): Promise<{ available: boolean }> {
      return clientApiRequest('/users?action=check-username', {
        method: 'POST',
        body: { username },
        requiresAuth: true
      });
    },

    /**
     * Changer le mot de passe
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
      return clientApiRequest('/users', {
        method: 'POST',
        body: { currentPassword, newPassword },
        params: { action: 'change-password' },
        requiresAuth: true
      });
    },

    /**
     * Supprimer le compte utilisateur
     */
    async deleteAccount(): Promise<{ success: boolean }> {
      return clientApiRequest('/users', {
        method: 'DELETE',
        requiresAuth: true
      });
    },

    /**
     * Obtenir les notes d'un utilisateur
     */
    async getUserRatings(userId?: string | number): Promise<UserRatingsResponse> {
      const id = userId || 'me';
      return clientApiRequest(`/users/${id}/pokemon`, {
        params: { action: 'ratings' },
        requiresAuth: true,
        noCache: true
      });
    },

    /**
     * Obtenir les Pokemon favoris d'un utilisateur
     */
    async getUserFavorites(userId?: string | number): Promise<{ favorites: number[] }> {
      const id = userId || 'me';
      return clientApiRequest(`/users/${id}/pokemon`, {
        params: { action: 'favorites' },
        requiresAuth: true,
        noCache: true
      });
    },

    /**
     * Noter un Pokemon
     */
    async ratePokemon(
      pokemonId: number, 
      rating: number, 
      userId?: string | number
    ): Promise<{ updatedRating: number; numberOfVotes: number }> {
      const id = userId || 'me';
      return clientApiRequest(`/users/${id}/pokemon`, {
        method: 'POST',
        body: { rating },
        params: { action: 'rate', pokedexId: pokemonId },
        requiresAuth: true
      });
    },

    /**
     * Basculer le statut favori d'un Pokemon
     */
    async toggleFavorite(
      pokemonId: number,
      userId?: string | number
    ): Promise<{ isFavorite: boolean }> {
      const id = userId || 'me';
      return clientApiRequest(`/users/${id}/pokemon`, {
        method: 'POST',
        params: { action: 'toggle-favorite', pokedexId: pokemonId },
        requiresAuth: true
      });
    }
  },

  // =============== POKEMON ===============
  pokemon: {
    /**
     * Obtenir la liste des Pokemon avec pagination
     */
    async getList(page = 0, limit = 20): Promise<PokemonListResponse> {
      return clientApiRequest('/pokemon', {
        params: { action: 'list', page, limit }
      });
    },

    /**
     * Obtenir les formes alternatives des Pokemon
     */
    async getAlternateForms(offset = 898, limit = 1000): Promise<PokemonListResponse> {
      return clientApiRequest('/pokemon', {
        params: { action: 'alternate-forms', offset, limit }
      });
    },

    /**
     * Obtenir les Pokemon les mieux notés
     */
    async getTopRated(limit = 10): Promise<any[]> {
      // Récupérer d'abord les données de notation depuis le backend
      const topRatedData = await clientApiRequest('/pokemon', {
        params: { action: 'top-rated', limit }
      });

      // Si pas de données, retourner un tableau vide
      if (!topRatedData || topRatedData.length === 0) {
        return [];
      }

      // Récupérer les données complètes des Pokémon via l'API PokeAPI
      const pokemonIds = topRatedData.map((p: any) => p.pokedexId);
      const fullPokemonData = await this.getByIds(pokemonIds);

      // Enrichir les données avec les ratings
      return fullPokemonData.map((pokemon: any) => {
        const ratingData = topRatedData.find((r: any) => r.pokedexId === pokemon.id);
        return {
          ...pokemon,
          rating: ratingData?.rating || 0,
          numberOfVotes: ratingData?.numberOfVotes || 0
        };
      });
    },

    /**
     * Obtenir les Pokemon tendance
     */
    async getTrending(limit = 10): Promise<any[]> {
      // Récupérer d'abord les données de notation depuis le backend
      const trendingData = await clientApiRequest('/pokemon', {
        params: { action: 'trending', limit }
      });

      // Si pas de données, retourner un tableau vide
      if (!trendingData || trendingData.length === 0) {
        return [];
      }

      // Récupérer les données complètes des Pokémon via l'API PokeAPI
      const pokemonIds = trendingData.map((p: any) => p.pokedexId);
      const fullPokemonData = await this.getByIds(pokemonIds);

      // Enrichir les données avec les ratings
      return fullPokemonData.map((pokemon: any) => {
        const ratingData = trendingData.find((r: any) => r.pokedexId === pokemon.id);
        return {
          ...pokemon,
          rating: ratingData?.rating || 0,
          numberOfVotes: ratingData?.numberOfVotes || 0
        };
      });
    },

    /**
     * Rechercher des Pokemon par nom
     */
    async search(query: string): Promise<any[]> {
      return clientApiRequest('/pokemon', {
        params: { action: 'search', q: query }
      });
    },

    /**
     * Obtenir le nombre total de Pokemon
     */
    async getCount(): Promise<number> {
      const result = await clientApiRequest('/pokemon', {
        params: { action: 'count' }
      });
      return result.count;
    },

    /**
     * Obtenir les détails d'un Pokemon par ID
     */
    async getById(id: number, includeUserData = false): Promise<any> {
      return clientApiRequest(`/pokemon/${id}`, {
        params: includeUserData ? { includeUserData: 'true' } : {},
        noCache: includeUserData
      });
    },

    /**
     * Obtenir les informations de notation d'un Pokemon
     */
    async getRating(id: number): Promise<PokemonRatingData> {
      const pokemon = await this.getById(id);
      return {
        rating: pokemon.rating || 0,
        numberOfVotes: pokemon.numberOfVotes || 0,
        userRating: pokemon.userRating
      };
    },

    /**
     * Obtenir plusieurs Pokemon par leurs IDs
     */
    async getByIds(ids: number[]): Promise<any[]> {
      if (ids.length === 0) return [];
      
      return clientApiRequest('/pokemon', {
        params: { action: 'batch', ids: ids.join(',') }
      });
    },

    /**
     * Obtenir les métadonnées de tous les Pokemon
     */
    async getAllMetadata(limit = 1500): Promise<any[]> {
      return clientApiRequest('/pokemon', {
        params: { action: 'metadata', limit }
      });
    },

    /**
     * Obtenir les notes de plusieurs Pokemon en une fois
     */
    async getBatchRatings(ids: number[]): Promise<Record<number, PokemonRatingData>> {
      if (ids.length === 0) return {};
      
      return clientApiRequest('/pokemon/ratings/batch', {
        params: { ids: ids.join(',') }
      });
    },

    /**
     * Obtenir des Pokemon par type (utilise directement PokeAPI)
     */
    async getByType(typeName: string, limit = 12): Promise<any[]> {
      try {
        // Appel direct à PokeAPI pour récupérer les Pokemon par type
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`);
        
        if (!response.ok) {
          console.warn(`Type ${typeName} not found in PokeAPI`);
          return [];
        }

        const typeData = await response.json();
        const pokemonList = typeData.pokemon || [];

        // Extraire les IDs des Pokemon et limiter les résultats
        const pokemonIds = pokemonList
          .slice(0, limit)
          .map((entry: any) => {
            const url = entry.pokemon.url;
            const id = parseInt(url.split('/').slice(-2, -1)[0]);
            return id;
          })
          .filter((id: number) => !isNaN(id));

        // Récupérer les détails de chaque Pokemon
        const pokemonDetails = await Promise.all(
          pokemonIds.map(async (id: number) => {
            try {
              const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
              if (pokemonResponse.ok) {
                return await pokemonResponse.json();
              }
              return null;
            } catch (error) {
              console.error(`Error fetching Pokemon ${id}:`, error);
              return null;
            }
          })
        );

        const validPokemon = pokemonDetails.filter((pokemon: any) => pokemon !== null);
        console.log(`Found ${validPokemon.length} Pokemon of type ${typeName}`);
        
        return validPokemon;
      } catch (error) {
        console.error(`Error finding Pokemon by type ${typeName}:`, error);
        return [];
      }
    }
  }
};

// =============== API SERVEUR (pour les Server Components) ===============
export const serverApi = {
  // Utilise serverApiRequest au lieu de clientApiRequest
  pokemon: {
    async getList(options: { page?: number; limit?: number } = {}): Promise<PokemonListResponse> {
      const { page = 0, limit = 20 } = options;
      const offset = page * limit;
      
      // Get basic Pokémon list from PokeAPI
      const pokemonList = await serverPokeApiRequest(`/pokemon?limit=${limit}&offset=${offset}`);
      
      if (!pokemonList) {
        throw new Error('Failed to fetch Pokémon list');
      }
      
      // Get details for each Pokémon
      const detailsPromises = pokemonList.results.map(async (pokemon: any) => {
        try {
          const response = await fetch(pokemon.url, { cache: 'force-cache' });
          if (!response.ok) return null;
          return response.json();
        } catch (error) {
          console.error(`Error fetching ${pokemon.name}:`, error);
          return null;
        }
      });
      
      const pokemonDetails = await Promise.all(detailsPromises);
      const validDetails = pokemonDetails.filter(Boolean);
      
      // Get ratings for all Pokémon
      const pokedexIds = validDetails.map((p: any) => p.id);
      
      if (pokedexIds.length > 0) {
        const ratingsData = await serverApiRequest(`/pokemons/ratings/batch`, {
          params: { ids: pokedexIds.join(',') },
          cache: 'no-store'
        });
        
        // Combine Pokémon details with ratings
        const enhancedPokemons = validDetails.map((pokemon: any) => ({
          ...pokemon,
          rating: ratingsData[pokemon.id]?.rating || 0,
          numberOfVotes: ratingsData[pokemon.id]?.numberOfVotes || 0
        }));
        
        return {
          pokemons: enhancedPokemons,
          hasMore: !!pokemonList.next,
          total: pokemonList.count
        };
      }
      
      return {
        pokemons: validDetails,
        hasMore: !!pokemonList.next,
        total: pokemonList.count
      };
    },

    async getByIds(ids: number[]): Promise<any[]> {
      if (ids.length === 0) return [];
      
      // Fetch details for each requested Pokemon
      const detailsPromises = ids.map(async (id) => {
        try {
          const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
          const response = await fetch(url, { cache: 'force-cache' });
          if (!response.ok) return null;
          return response.json();
        } catch (error) {
          console.error(`Error fetching Pokemon ${id}:`, error);
          return null;
        }
      });
      
      const pokemonDetails = await Promise.all(detailsPromises);
      const validDetails = pokemonDetails.filter(Boolean);
      
      // Get ratings for all Pokémon
      const pokedexIds = validDetails.map((p: any) => p.id);
      
      if (pokedexIds.length > 0) {
        const ratingsData = await serverApiRequest(`/pokemons/ratings/batch`, {
          params: { ids: pokedexIds.join(',') },
          cache: 'no-store'
        });
        
        // Combine Pokémon details with ratings
        return validDetails.map((pokemon: any) => ({
          ...pokemon,
          rating: ratingsData[pokemon.id]?.rating || 0,
          numberOfVotes: ratingsData[pokemon.id]?.numberOfVotes || 0
        }));
      }
      
      return validDetails;
    },

    async getAlternateForms(options: { limit?: number; offset?: number } = {}): Promise<any[]> {
      const { limit = 1000, offset = 898 } = options;
      
      const data = await serverPokeApiRequest(`/pokemon?limit=${limit}&offset=${offset}`);
      
      if (!data) {
        throw new Error('Failed to fetch alternate forms');
      }
      
      // Get details for each form
      const formDetailsPromises = data.results.map(async (pokemon: any) => {
        try {
          const detailResponse = await fetch(pokemon.url, { cache: 'force-cache' });
          if (!detailResponse.ok) return null;
          return detailResponse.json();
        } catch (error) {
          console.error(`Error fetching ${pokemon.name}:`, error);
          return null;
        }
      });
      
      const formDetails = await Promise.all(formDetailsPromises);
      return formDetails.filter(Boolean);
    },

    async getTopRated(limit = 10): Promise<any[]> {
      // Récupérer d'abord les données de notation depuis le backend
      const topRatedData = await serverApiRequest('/pokemons/top-rated', {
        params: { limit },
        cache: 'no-store'
      });

      // Si pas de données, retourner un tableau vide
      if (!topRatedData || topRatedData.length === 0) {
        return [];
      }

      // Récupérer les données complètes des Pokémon via l'API PokeAPI
      const pokemonIds = topRatedData.map((p: any) => p.pokedexId);
      const fullPokemonData = await this.getByIds(pokemonIds);

      // Enrichir les données avec les ratings
      return fullPokemonData.map((pokemon: any) => {
        const ratingData = topRatedData.find((r: any) => r.pokedexId === pokemon.id);
        return {
          ...pokemon,
          rating: ratingData?.rating || 0,
          numberOfVotes: ratingData?.numberOfVotes || 0
        };
      });
    },

    async getTrending(limit = 10): Promise<any[]> {
      // Récupérer d'abord les données de notation depuis le backend
      const trendingData = await serverApiRequest('/pokemons/trending', {
        params: { limit },
        cache: 'no-store'
      });

      // Si pas de données, retourner un tableau vide
      if (!trendingData || trendingData.length === 0) {
        return [];
      }

      // Récupérer les données complètes des Pokémon via l'API PokeAPI
      const pokemonIds = trendingData.map((p: any) => p.pokedexId);
      const fullPokemonData = await this.getByIds(pokemonIds);

      // Enrichir les données avec les ratings
      return fullPokemonData.map((pokemon: any) => {
        const ratingData = trendingData.find((r: any) => r.pokedexId === pokemon.id);
        return {
          ...pokemon,
          rating: ratingData?.rating || 0,
          numberOfVotes: ratingData?.numberOfVotes || 0
        };
      });
    },

    async search(query: string): Promise<any[]> {
      // Get list of all Pokémon
      const data = await serverPokeApiRequest('/pokemon?limit=1500');
      
      if (!data) {
        throw new Error('Failed to fetch Pokémon for search');
      }
      
      // Filter Pokémon by name
      const filteredResults = data.results.filter(
        (pokemon: any) => pokemon.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20); // Limit to 20 results
      
      if (!filteredResults.length) {
        return [];
      }
      
      // Get details for each filtered Pokémon
      const pokemonDetailsPromises = filteredResults.map(async (pokemon: any) => {
        try {
          const detailResponse = await fetch(pokemon.url, { cache: 'force-cache' });
          if (!detailResponse.ok) return null;
          return detailResponse.json();
        } catch (error) {
          return null;
        }
      });
      
      const pokemonDetails = await Promise.all(pokemonDetailsPromises);
      return pokemonDetails.filter(Boolean);
    },

    async getCount(): Promise<number> {
      const data = await serverPokeApiRequest('/pokemon/?limit=1');
      return data?.count || 1500;
    },

    async getAllMetadata(limit = 1500): Promise<any[]> {
      // Use PokeAPI to get minimal metadata
      const response = await serverPokeApiRequest(`/pokemon?limit=${limit}`);
      
      if (!response?.results) {
        throw new Error('Failed to fetch Pokemon metadata');
      }

      // Transform results into lightweight metadata
      const metadata = await Promise.all(
        response.results.map(async (pokemon: any) => {
          const id = parseInt(pokemon.url.split('/').filter(Boolean).pop() || '0');
          
          // For types, we need to make an additional light request
          // We limit this to the first 100 Pokemon for initial display
          let types = [];
          if (id <= 100) { // Limit requests for types
            try {
              const details = await serverPokeApiRequest(`/pokemon/${id}`);
              types = details.types || [];
            } catch (err) {
              // Ignore errors, we'll use an empty array
            }
          }
          
          return {
            id,
            name: pokemon.name,
            sprites: {
              front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            },
            types,
            // Add default fields to avoid errors
            rating: 0,
            numberOfVotes: 0
          };
        })
      );
      
      return metadata;
    },

    async getBatchRatings(ids: number[]): Promise<Record<number, PokemonRatingData>> {
      if (ids.length === 0) return {};
      
      return serverApiRequest(`/pokemons/ratings/batch`, {
        params: { ids: ids.join(',') },
        cache: 'no-store'
      });
    },

    async getDetails(id: number): Promise<any> {
      try {
        // D'abord, récupérer les données complètes du Pokémon depuis PokeAPI
        const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
          cache: 'force-cache'
        });
        
        if (!pokemonData.ok) {
          throw new Error(`Pokemon not found: ${id}`);
        }
        
        const pokemon = await pokemonData.json();
        
        // Ensuite, récupérer les données de rating depuis notre backend
        try {
          const ratingData = await serverApiRequest(`/pokemons/pokedexId/${id}`, {
            cache: 'no-store'
          });
          
          // Combiner les données
          return {
            ...pokemon,
            rating: ratingData?.rating || 0,
            numberOfVotes: ratingData?.numberOfVotes || 0,
            pokedexId: id
          };
        } catch (ratingError) {
          console.warn(`Failed to get rating data for Pokemon ${id}:`, ratingError);
          // Retourner les données PokeAPI seules si les ratings échouent
          return {
            ...pokemon,
            rating: 0,
            numberOfVotes: 0,
            pokedexId: id
          };
        }
      } catch (error) {
        console.error(`Error fetching Pokemon details for ${id}:`, error);
        throw error;
      }
    }
  },

  user: {
    async getProfile(userId?: number | string, token?: string): Promise<any> {
      const id = userId || 'me';
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return serverApiRequest(`/user/${id}`, {
        headers,
        requiresAuth: !token
      });
    },

    async getUserRatings(userId: number | string, token?: string): Promise<UserRatingsResponse> {
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return serverApiRequest(`/user/${userId}/ratings`, {
        headers,
        requiresAuth: !token,
        cache: 'no-store'
      });
    },

    async getUserFavorites(userId: number | string, token?: string): Promise<{ favorites: number[] }> {
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return serverApiRequest(`/user/${userId}/favorite-pokemon`, {
        headers,
        requiresAuth: !token,
        cache: 'no-store'
      });
    }
  }
};

/**
 * Fonction pour les requêtes PokeAPI côté client
 */
async function clientPokeApiRequest<T = any>(path: string): Promise<T> {
  try {
    const url = `https://pokeapi.co/api/v2${path}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`PokeAPI request failed: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('[PokeAPI] Request error:', error);
    throw error;
  }
}

// Export par défaut
export default api;
