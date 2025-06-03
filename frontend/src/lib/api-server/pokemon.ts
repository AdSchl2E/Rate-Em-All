import { pokemonType } from '../../types/pokemon';
import { API_CONFIG } from '../api-config';

// Récupérer les meilleurs Pokémon
export async function fetchTopRated(limit: number = 10): Promise<pokemonType[]> {
  // Correction: Suppression de "/api" dans l'URL
  const res = await fetch(`${API_CONFIG.baseUrl}/pokemons/top-rated?limit=${limit}`, {
    next: API_CONFIG.cacheConfig.medium
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch top rated pokemons');
  }
  
  const data = await res.json();
  
  // Enrichir avec les détails de l'API Pokémon
  return await Promise.all(
    data.map(async (pokemon: any) => {
      try {
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokedexId}`, {
          next: API_CONFIG.cacheConfig.long
        });
        
        if (!pokeRes.ok) {
          return {
            ...pokemon,
            id: pokemon.pokedexId,
            sprites: {
              front_default: '/placeholder.png',
              other: { 'official-artwork': { front_default: '/placeholder.png' } }
            }
          };
        }
        
        const pokeData = await pokeRes.json();
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
          sprites: {
            front_default: '/placeholder.png',
            other: { 'official-artwork': { front_default: '/placeholder.png' } }
          }
        };
      }
    })
  );
}

// Récupérer les Pokémon tendance
export async function fetchTrending(limit: number = 10): Promise<pokemonType[]> {
  // Correction: Appel direct au bon endpoint
  const res = await fetch(`${API_CONFIG.baseUrl}/pokemons/trending?limit=${limit}`, {
    next: API_CONFIG.cacheConfig.short
  });
  
  if (!res.ok) {
    // Fallback à topRated si l'endpoint trending n'est pas implémenté
    return fetchTopRated(limit);
  }
  
  const data = await res.json();
  
  // Même enrichissement que pour topRated
  // Code d'enrichissement similaire à fetchTopRated...
  return await Promise.all(
    data.map(async (pokemon: any) => {
      try {
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokedexId}`, {
          next: API_CONFIG.cacheConfig.long
        });
        
        if (!pokeRes.ok) {
          return {
            ...pokemon,
            id: pokemon.pokedexId,
            sprites: {
              front_default: '/placeholder.png',
              other: { 'official-artwork': { front_default: '/placeholder.png' } }
            }
          };
        }
        
        const pokeData = await pokeRes.json();
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
          sprites: {
            front_default: '/placeholder.png',
            other: { 'official-artwork': { front_default: '/placeholder.png' } }
          }
        };
      }
    })
  );
}

// Récupérer les détails d'un Pokémon
export async function fetchPokemonDetails(id: number): Promise<pokemonType> {
  try {
    // Récupération parallèle des données de base et des notes
    const [pokeDetails, ratings] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
        next: API_CONFIG.cacheConfig.long
      }).then(res => res.json()),
      
      // Correction: Suppression de "/api" dans l'URL
      fetch(`${API_CONFIG.baseUrl}/pokemons/pokedexId/${id}`, {
        next: API_CONFIG.cacheConfig.short
      }).then(res => res.ok ? res.json() : { rating: 0, numberOfVotes: 0 })
    ]);
    
    // Fusionner les données
    return {
      ...pokeDetails,
      rating: ratings.rating || 0,
      numberOfVotes: ratings.numberOfVotes || 0,
    };
  } catch (error) {
    console.error('Error fetching pokemon details:', error);
    throw error;
  }
}