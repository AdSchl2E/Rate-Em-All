import { clientApiRequest } from './base';
import type { PokemonListResponse, PokemonRatingData } from '../shared/types';
import type { Pokemon } from '../../../types/pokemon';

export const clientPokemon = {
  /**
   * Get list of Pokemon with optional pagination
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
   */
  async getCount(): Promise<number> {
    const response = await clientApiRequest('/pokemon', {
      params: { action: 'count' }
    });
    return response.count;
  },
  
  /**
   * Get Pokemon details by ID
   */
  async getById(id: number, includeUserData = false): Promise<Pokemon> {
    return clientApiRequest(`/pokemon/${id}`, {
      requiresAuth: includeUserData,
      noCache: true
    });
  },
  
  /**
   * Get Pokemon rating information
   */
  async getRating(id: number): Promise<PokemonRatingData> {
    return clientApiRequest(`/pokemon/${id}/rating`, {
      noCache: true
    });
  },
  
  /**
   * Get multiple Pokemon by IDs
   */
  async getByIds(ids: number[]): Promise<Pokemon[]> {
    if (!ids.length) return [];
    
    // Utiliser l'action 'list' pour obtenir les informations complètes des Pokémon
    const response = await clientApiRequest('/pokemon', {
      params: { 
        action: 'list',
        ids: ids.join(',')
      },
      noCache: true
    });
    
    // S'assurer qu'on retourne bien le tableau de Pokémon
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
   */
  async getAllMetadata(): Promise<Pokemon[]> {
    try {
      // Utiliser le nouveau endpoint avec action=metadata
      return clientApiRequest('/pokemon', {
        params: { 
          action: 'metadata',
          limit: 1500 // Assez grand pour inclure tous les Pokémon
        }
      });
    } catch (error) {
      console.error('Error fetching Pokemon metadata:', error);
      return [];
    }
  }
};