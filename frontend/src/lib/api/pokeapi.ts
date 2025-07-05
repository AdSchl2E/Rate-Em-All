/**
 * Utilitaires pour les appels directs à PokeAPI
 * Utilisé principalement côté serveur pour récupérer les données Pokémon de base
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Appel direct à PokeAPI côté serveur
 */
export async function serverPokeApiRequest<T = any>(
  path: string,
  cacheTime = 86400 // 1 jour par défaut
): Promise<T> {
  try {
    const url = `${POKEAPI_BASE_URL}${path}`;
    
    const response = await fetch(url, {
      next: { 
        revalidate: cacheTime 
      }
    });
    
    if (!response.ok) {
      throw new Error(`PokeAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('[PokeAPI] Request error:', error);
    throw error;
  }
}

/**
 * Charger les données complètes d'un Pokémon (avec données d'espèce)
 */
export async function loadPokemonWithSpeciesData(pokemonId: number): Promise<any> {
  try {
    // Récupérer les données de base du Pokémon
    const pokemonData = await serverPokeApiRequest(`/pokemon/${pokemonId}`);
    
    // Récupérer les données d'espèce
    const speciesData = await serverPokeApiRequest(`/pokemon-species/${pokemonId}`);
    
    // Combiner les données
    return {
      ...pokemonData,
      species: speciesData,
      generation: speciesData.generation?.name || 'unknown',
      is_legendary: speciesData.is_legendary || false,
      is_mythical: speciesData.is_mythical || false,
      pokedexId: pokemonId
    };
  } catch (error) {
    console.error(`Error loading Pokemon ${pokemonId}:`, error);
    // Retourner des données par défaut en cas d'erreur
    return {
      id: pokemonId,
      name: `pokemon-${pokemonId}`,
      sprites: {
        front_default: null,
        other: {
          'official-artwork': {
            front_default: null
          }
        }
      },
      types: [],
      stats: [],
      abilities: [],
      height: 0,
      weight: 0,
      base_experience: 0,
      pokedexId: pokemonId,
      generation: 'unknown',
      is_legendary: false,
      is_mythical: false
    };
  }
}
