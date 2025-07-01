import { clientApiRequest } from './base';
import type { PokemonListResponse, PokemonRatingData } from '../shared/types';
import type { Pokemon } from '../../../types/pokemon';

/**
 * Client-side Pokemon API utilities
 * For use in client components only ('use client')
 */
export const clientPokemon = {
  /**
   * Get list of Pokemon with optional pagination
   * 
   * @param page - Page number for pagination (0-indexed)
   * @param limit - Number of Pokemon per page
   * @returns Response containing Pokemon list, pagination info
   */
  async getList(page = 0, limit = 20): Promise<PokemonListResponse> {
    return clientApiRequest('/pokemon', {
      params: {
        action: 'list',
        page,
        limit
      },
      noCache: true
    });
  },
  
  /**
   * Get alternate forms of Pokemon
   * 
   * @param offset - Starting index for Pokemon forms (typically 898)
   * @param limit - Maximum number of forms to retrieve
   * @returns Response containing list of Pokemon alternate forms
   */
  async getAlternateForms(offset = 898, limit = 1000): Promise<PokemonListResponse> {
    return clientApiRequest('/pokemon', {
      params: {
        action: 'alternate-forms',
        offset,
        limit
      }
    });
  },
  
  /**
   * Get top rated Pokemon
   * 
   * @param limit - Maximum number of Pokemon to retrieve
   * @returns Array of top rated Pokemon
   */
  async getTopRated(limit = 10): Promise<Pokemon[]> {
    return clientApiRequest('/pokemon', {
      params: {
        action: 'top-rated',
        limit
      },
      noCache: true
    });
  },
  
  /**
   * Get trending Pokemon
   * 
   * @param limit - Maximum number of Pokemon to retrieve
   * @returns Array of trending Pokemon
   */
  async getTrending(limit = 10): Promise<Pokemon[]> {
    return clientApiRequest('/pokemon', {
      params: {
        action: 'trending',
        limit
      },
      noCache: true
    });
  },
  
  /**
   * Search Pokemon by name
   * 
   * @param query - Search term to match against Pokemon names
   * @returns Array of matching Pokemon
   */
  async search(query: string): Promise<Pokemon[]> {
    return clientApiRequest('/pokemon', {
      params: {
        action: 'search',
        q: query
      },
      noCache: true
    });
  },
  
  /**
   * Get total Pokemon count
   * 
   * @returns Total number of Pokemon in the database
   */
  async getCount(): Promise<number> {
    const response = await clientApiRequest('/pokemon', {
      params: { action: 'count' }
    });
    return response.count;
  },
  
  /**
   * Get Pokemon details by ID
   * 
   * @param id - Pokedex ID of the Pokemon to retrieve
   * @param includeUserData - Whether to include user-specific data (ratings, favorites)
   * @returns Detailed Pokemon information
   */
  async getById(id: number, includeUserData = false): Promise<Pokemon> {
    return clientApiRequest(`/pokemon/${id}`, {
      requiresAuth: includeUserData,
      noCache: true
    });
  },
  
  /**
   * Get Pokemon rating information
   * 
   * @param id - Pokedex ID of the Pokemon
   * @returns Rating statistics for the Pokemon
   */
  async getRating(id: number): Promise<PokemonRatingData> {
    return clientApiRequest(`/pokemon/${id}/rating`, {
      noCache: true
    });
  },
  
  /**
   * Get multiple Pokemon by IDs
   * 
   * @param ids - Array of Pokemon IDs to retrieve
   * @returns Array of Pokemon objects
   */
  async getByIds(ids: number[]): Promise<Pokemon[]> {
    if (!ids.length) return [];
    
    // Use 'list' action to get complete Pokemon information
    const response = await clientApiRequest('/pokemon', {
      params: { 
        action: 'list',
        ids: ids.join(',')
      },
      noCache: true
    });
    
    // Ensure we return the Pokemon array
    if (response && response.pokemons && Array.isArray(response.pokemons)) {
      return response.pokemons;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.error("Unexpected response format from getByIds:", response);
      return [];
    }
  },

  /**
   * Get ratings for multiple Pokemon by IDs (batch)
   * 
   * @param ids - Array of Pokemon IDs to get ratings for
   * @returns Object mapping Pokemon IDs to rating statistics
   */
  async getBatchRatings(ids: number[]): Promise<Record<string, { rating: number, numberOfVotes: number }>> {
    if (!ids.length) return {};
    
    return clientApiRequest('/pokemon', {
      params: { 
        action: 'batch',
        ids: ids.join(',')
      },
      noCache: true
    });
  },

  /**
   * Get lightweight metadata for all Pokemon (for filtering purposes)
   * 
   * @returns Array of Pokemon with basic metadata
   */
  async getAllMetadata(): Promise<Pokemon[]> {
    try {
      // Use the metadata endpoint
      return clientApiRequest('/pokemon', {
        params: { 
          action: 'metadata',
          limit: 1500 // Large enough to include all Pokemon
        }
      });
    } catch (error) {
      console.error('Error fetching Pokemon metadata:', error);
      return [];
    }
  }
};