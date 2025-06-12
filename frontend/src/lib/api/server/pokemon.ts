import { serverApiRequest, serverPokeApiRequest } from './base';
import { API_CONFIG } from '../shared/config';
import type { Pokemon } from '../../../types/pokemon';

/**
 * Récupérer les meilleurs Pokémon - version serveur
 * Utilisable uniquement dans les composants serveur
 */
export async function getTopRatedPokemon(limit: number = 10): Promise<Pokemon[]> {
  // Appel direct au backend
  const data = await serverApiRequest(API_CONFIG.endpoints.pokemon.topRated, {
    params: { limit },
    cache: 'no-store' // Toujours des données fraîches
  });
  
  // Enrichir avec les détails de l'API Pokémon
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
        return {
          ...pokemon,
          id: pokemon.pokedexId,
          name: pokemon.name || `Unknown #${pokemon.pokedexId}`,
          sprites: {
            front_default: '/images/pokeball.png',
            other: { 'official-artwork': { front_default: '/images/pokeball.png' } }
          },
          types: []
        };
      }
    })
  );
}

/**
 * Récupérer les Pokémon tendance - version serveur
 */
export async function getTrendingPokemon(limit: number = 10): Promise<Pokemon[]> {
  try {
    // Appel direct au backend
    const data = await serverApiRequest(API_CONFIG.endpoints.pokemon.trending, {
      params: { limit },
      cache: 'no-store' // Toujours des données fraîches
    });
    
    // Enrichir avec les détails de l'API Pokémon
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
 * Récupérer les détails d'un Pokémon - version serveur
 */
export async function getPokemonDetails(id: number): Promise<Pokemon> {
  try {
    // Récupération parallèle des données de base et des notes
    const [pokeDetails, ratings] = await Promise.all([
      serverPokeApiRequest(`/pokemon/${id}`),
      serverApiRequest(API_CONFIG.endpoints.pokemon.details(id))
        .catch(() => ({ rating: 0, numberOfVotes: 0 }))
    ]);
    
    // Fusionner les données
    return {
      ...pokeDetails,
      rating: ratings.rating || 0,
      numberOfVotes: ratings.numberOfVotes || 0,
    };
  } catch (error) {
    console.error('Error fetching pokemon details:', error);
    return defaultPokemonData({ id, pokedexId: id });
  }
}

/**
 * Générer des données Pokémon par défaut pour les cas d'erreur
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
 * Récupérer les Pokémon par type
 * @param type Le type de Pokémon à rechercher (ex: "fire", "water")
 * @param limit Nombre maximum de Pokémon à récupérer
 * @param excludeIds IDs de Pokémon à exclure des résultats (facultatif)
 */
export async function getPokemonByType(
  type: string,
  limit: number = 5,
  excludeIds: number[] = []
): Promise<Pokemon[]> {
  if (!type) return [];
  
  try {
    // Récupérer les Pokémon du type spécifié depuis PokeAPI
    const response = await serverPokeApiRequest(`/type/${type}`);
    
    if (!response?.pokemon) return [];
    
    // Filtrer pour exclure les IDs spécifiés et limiter les résultats
    const filteredPokemon = response.pokemon
      .filter((entry: any) => {
        // Extraire l'ID du Pokémon de l'URL
        const url = entry.pokemon.url;
        const id = parseInt(url.split('/').filter(Boolean).pop());
        return !excludeIds.includes(id);
      })
      .slice(0, limit);
    
    // Récupérer les détails complets pour chaque Pokémon
    const detailedPokemon = await Promise.all(
      filteredPokemon.map(async (entry: any) => {
        try {
          const url = entry.pokemon.url;
          const id = parseInt(url.split('/').filter(Boolean).pop());
          
          // Récupérer les détails du Pokémon avec les notes
          const pokemon = await getPokemonDetails(id);
          return pokemon;
        } catch (error) {
          console.error(`Error fetching details for pokemon:`, error);
          return null;
        }
      })
    );
    
    // Filtrer les valeurs null (en cas d'échec de récupération)
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
  getPokemonByType, // Ajouter la nouvelle fonction
  
  /**
   * Récupérer tous les Pokémon avec pagination - version serveur
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
   * Alias pour getAll pour compatibilité d'API
   */
  getAllPokemon: async function({ limit = 100, page = 0 } = {}) {
    const result = await this.getAll(page, limit);
    return result.pokemons;
  },
  
  /**
   * Récupérer tous les types de Pokémon
   */
  async getAllTypes(): Promise<string[]> {
    try {
      // Types de Pokémon depuis l'API PokeAPI
      const response = await serverPokeApiRequest('/type');
      
      if (!response?.results) {
        console.error('Invalid response format for Pokemon types:', response);
        return [];
      }
      
      // Extraire juste les noms des types
      return response.results
        .filter((type: any) => !['unknown', 'shadow'].includes(type.name))
        .map((type: any) => type.name);
    } catch (error) {
      console.error('Failed to fetch pokemon types:', error);
      return [];
    }
  },
  
  /**
   * Récupérer le nombre total de Pokémon
   */
  async getTotalCount(): Promise<number> {
    try {
      // Utiliser directement l'API PokeAPI pour le comptage
      const response = await serverPokeApiRequest('/pokemon?limit=1');
      
      return response?.count || 898;
    } catch (error) {
      console.error('Failed to fetch total pokemon count:', error);
      return 898; // Valeur par défaut
    }
  }
};