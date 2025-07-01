import { serverApiRequest, serverPokeApiRequest } from './base';
import { API_CONFIG } from '../shared/config';
import type { Pokemon } from '../../../types/pokemon';
import { spec } from 'node:test/reporters';

/**
 * Gets the top rated Pokémon - server version
 * For use in server components only
 * @param limit - Maximum number of Pokémon to retrieve
 * @returns Array of Pokémon with detailed information
 */
export async function getTopRatedPokemon(limit: number = 10): Promise<Pokemon[]> {
  // Direct backend call
  const data = await serverApiRequest(API_CONFIG.endpoints.pokemon.topRated, {
    params: { limit },
    cache: 'no-store' // Always get fresh data
  });
  
  // Enrich with details from Pokémon API, including species data
  return await Promise.all(
    data.map(async (pokemon: any) => {
      try {
        return await loadPokemonWithSpeciesData(pokemon.pokedexId);
      } catch (error) {
        console.error(`Error fetching Pokemon ${pokemon.pokedexId}:`, error);
        return defaultPokemonData({
          ...pokemon,
          id: pokemon.pokedexId,
        });
      }
    })
  );
}

/**
 * Gets the trending Pokémon - server version
 * @param limit - Maximum number of Pokémon to retrieve
 * @returns Array of trending Pokémon with detailed information
 */
export async function getTrendingPokemon(limit: number = 10): Promise<Pokemon[]> {
  try {
    // Direct backend call
    const data = await serverApiRequest(API_CONFIG.endpoints.pokemon.trending, {
      params: { limit },
      cache: 'no-store' // Always get fresh data
    });
    
    // Enrich with details from Pokémon API
    return await Promise.all(
      data.map(async (pokemon: any) => {
        try {
          const pokeData = await serverPokeApiRequest(`/pokemon/${pokemon.pokedexId}`);
          return {
            ...pokeData,
            rating: pokemon.rating,
            numberOfVotes: pokemon.numberOfVotes
          };
        } catch (error) {
          console.error(`Error fetching Pokemon ${pokemon.pokedexId}:`, error);
          return defaultPokemonData(pokemon);
        }
      })
    );
  } catch (error) {
    console.error('Failed to fetch trending pokemon:', error);
    return [];
  }
}

/**
 * Gets details for a specific Pokémon - server version
 * Including species details (generation, legendary status, etc.)
 * @param id - Pokémon ID to retrieve
 * @returns Detailed Pokémon data including species information
 */
export async function getPokemonDetails(id: number): Promise<Pokemon> {
  try {
    // Parallel retrieval of basic data, ratings, and species information
    const [pokeDetails, ratings, initialSpeciesData] = await Promise.all([
      serverPokeApiRequest(`/pokemon/${id}`),
      serverApiRequest(API_CONFIG.endpoints.pokemon.details(id))
        .catch(() => ({ rating: 0, numberOfVotes: 0 })),
      serverPokeApiRequest(`/pokemon-species/${id}`)
        .catch(() => {return null;})
    ]);

    let speciesData = initialSpeciesData;

    if (speciesData === null) {
      const baseSpeciesData = await serverPokeApiRequest(`/pokemon-species/${pokeDetails.species.name}`);
      speciesData = baseSpeciesData || undefined; // If no species data is found, set to undefined
    }    
    // Merge data
    return {
      ...pokeDetails,
      rating: ratings.rating || 0,
      numberOfVotes: ratings.numberOfVotes || 0,
      // Add species information if available
      species_info: speciesData ? {
        is_legendary: speciesData.is_legendary,
        is_mythical: speciesData.is_mythical,
        is_baby: speciesData.is_baby,
        generation: speciesData.generation,
        color: speciesData.color,
        shape: speciesData.shape,
        habitat: speciesData.habitat,
        growth_rate: speciesData.growth_rate,
        evolution_chain: speciesData.evolution_chain,
        evolves_from_species: speciesData.evolves_from_species,
        egg_groups: speciesData.egg_groups,
        gender_rate: speciesData.gender_rate,
        capture_rate: speciesData.capture_rate,
        base_happiness: speciesData.base_happiness,
        hatch_counter: speciesData.hatch_counter,
        flavor_text_entries: speciesData.flavor_text_entries,
        genera: speciesData.genera,
        forms_switchable: speciesData.forms_switchable,
        has_gender_differences: speciesData.has_gender_differences,
        order: speciesData.order,
        varieties: speciesData.varieties
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching pokemon details:', error);
    return defaultPokemonData({ id, pokedexId: id });
  }
}

/**
 * Generate default Pokémon data for error cases
 * @param fallback - Optional fallback data to include
 * @returns Default Pokémon object with fallback values
 */
function defaultPokemonData(fallback: any = {}): Pokemon {
  return {
    id: fallback.pokedexId || fallback.id || 0,
    name: fallback.name || 'Unknown Pokémon',
    sprites: {
      front_default: '/images/pokeball.png',
      other: { 
        'official-artwork': { 
          front_default: '/images/pokeball.png' 
        } 
      }
    },
    types: [],
    rating: 0,
    numberOfVotes: 0,
    ...fallback
  } as Pokemon;
}

/**
 * Get Pokémon by type
 * @param type - The type of Pokémon to search for (e.g., "fire", "water")
 * @param limit - Maximum number of Pokémon to retrieve
 * @param excludeIds - Pokémon IDs to exclude from results (optional)
 * @returns Array of Pokémon of the specified type
 */
export async function getPokemonByType(
  type: string,
  limit: number = 14,
  excludeIds: number[] = []
): Promise<Pokemon[]> {
  if (!type) return [];
  
  try {
    // Get Pokémon of the specified type from PokeAPI
    const response = await serverPokeApiRequest(`/type/${type}`);
    
    if (!response?.pokemon) return [];
    
    // Filter to exclude specified IDs and limit results
    const filteredPokemon = response.pokemon
      .filter((entry: any) => {
        // Extract Pokémon ID from URL
        const url = entry.pokemon.url;
        const id = parseInt(url.split('/').filter(Boolean).pop());
        return !excludeIds.includes(id);
      })
      .slice(0, limit);
    
    // Get complete details for each Pokémon
    const detailedPokemon = await Promise.all(
      filteredPokemon.map(async (entry: any) => {
        try {
          const url = entry.pokemon.url;
          const id = parseInt(url.split('/').filter(Boolean).pop());
          
          // Get Pokémon details with ratings
          const pokemon = await getPokemonDetails(id);
          return pokemon;
        } catch (error) {
          console.error(`Error fetching details for pokemon:`, error);
          return null;
        }
      })
    );
    
    // Filter null values (in case of retrieval failure)
    return detailedPokemon.filter(Boolean) as Pokemon[];
  } catch (error) {
    console.error(`Failed to fetch pokemon by type ${type}:`, error);
    return [];
  }
}

export const serverPokemon = {
  getTopRated: getTopRatedPokemon,
  getTrending: getTrendingPokemon,
  getDetails: getPokemonDetails,
  getPokemonByType, // Add the new function
  
  /**
   * Get all Pokémon with pagination - server version
   * @param page - Page number for pagination
   * @param limit - Maximum number of Pokémon per page
   * @returns Object with Pokémon array, total count, and hasMore flag
   */
  async getAll(page: number = 0, limit: number = 100): Promise<{
    pokemons: Pokemon[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await serverApiRequest('/pokemons', {
        params: { page, limit },
        cache: 'no-store'
      });
      
      return {
        pokemons: response.pokemons || [],
        total: response.total || 0,
        hasMore: response.hasMore || false
      };
    } catch (error) {
      console.error('Failed to fetch all pokemons:', error);
      return { pokemons: [], total: 0, hasMore: false };
    }
  },
  
  /**
   * Alias for getAll for API compatibility
   * @param options - Optional pagination parameters
   * @returns Array of Pokémon
   */
  getAllPokemon: async function({ limit = 100, page = 0 } = {}) {
    const result = await this.getAll(page, limit);
    return result.pokemons;
  },
  
  /**
   * Get all Pokémon types
   * @returns Array of Pokémon type names
   */
  async getAllTypes(): Promise<string[]> {
    try {
      // Pokémon types from PokeAPI
      const response = await serverPokeApiRequest('/type');
      
      if (!response?.results) {
        console.error('Invalid response format for Pokemon types:', response);
        return [];
      }
      
      // Extract just the type names
      return response.results
        .filter((type: any) => !['unknown', 'shadow'].includes(type.name))
        .map((type: any) => type.name);
    } catch (error) {
      console.error('Failed to fetch pokemon types:', error);
      return [];
    }
  },
  
  /**
   * Get total number of Pokémon
   * @returns Total Pokémon count
   */
  async getTotalCount(): Promise<number> {
    try {
      // Use PokeAPI directly for counting
      const response = await serverPokeApiRequest('/pokemon?limit=1');
      
      return response?.count || 898;
    } catch (error) {
      console.error('Failed to fetch total pokemon count:', error);
      return 898; // Default value
    }
  }
};

/**
 * Load complete Pokémon data (including species data)
 * @param pokemonId - ID of the Pokémon to load
 * @returns Complete Pokémon data object
 */
async function loadPokemonWithSpeciesData(pokemonId: number): Promise<Pokemon> {
  try {
    return await getPokemonDetails(pokemonId);
  } catch (error) {
    console.error(`Failed to load complete pokemon data for ${pokemonId}:`, error);
    return defaultPokemonData({ id: pokemonId, pokedexId: pokemonId });
  }
}