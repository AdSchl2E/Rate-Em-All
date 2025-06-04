import { Pokemon } from '../../types/pokemon';
import { API_CONFIG } from '../api-config';

// Garder les urls relatives comme actuellement
export async function getPokemonRating(pokedexId: number, userId?: number, token?: string) {
  const url = `/api/pokemons/${pokedexId}${userId ? `?userId=${userId}` : ''}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    if (response.status === 404) {
      return { rating: 0, numberOfVotes: 0, isFavorite: false, userRating: 0 };
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pokemon rating:', error);
    return { rating: 0, numberOfVotes: 0, isFavorite: false, userRating: 0 };
  }
}

// Noter un Pokémon
export async function ratePokemonForUser(userId: number, pokedexId: number, rating: number, token: string) {
  try {
    console.log(`Rating Pokémon ${pokedexId} with score ${rating} for user ${userId}`);
    
    const response = await fetch(`/api/user/${userId}/rate-pokemon/${pokedexId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ rating })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rating API error:', response.status, errorText);
      throw new Error(`Failed to rate Pokémon: ${errorText}`);
    }

    const data = await response.json();
    
    // Retourner les données mises à jour
    return {
      updatedRating: data.pokemon?.rating || 0,
      numberOfVotes: data.pokemon?.numberOfVotes || 0,
      userRating: data.userRating?.rating || rating
    };
  } catch (error) {
    console.error('Error in ratePokemonForUser:', error);
    throw error;
  }
}

// Ajouter/Retirer un Pokémon des favoris
export async function setFavoritePokemonForUser(userId: number, pokedexId: number, token: string) {
  const response = await fetch(`/api/user/${userId}/favorite-pokemon/${pokedexId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la modification des favoris');
  }
  return response.json();
}

// Récupérer plusieurs Pokémon par leurs IDs
export async function fetchPokemonsByIds(pokemonIds: number[]): Promise<Pokemon[]> {
  if (!pokemonIds || pokemonIds.length === 0) {
    return [];
  }
  
  try {
    // Obtenir les notes en batch
    const ratingsResponse = await fetch(`/api/pokemons/batch-ratings?ids=${pokemonIds.join(',')}`);
    const ratingsData = await ratingsResponse.json();
    
    // Récupérer les détails de chaque Pokémon
    const pokemons = await Promise.all(
      pokemonIds.map(async (id) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
            cache: 'force-cache'
          });
          
          if (!response.ok) {
            throw new Error(`Error fetching Pokémon ${id}: ${response.status}`);
          }
          
          const pokemonData = await response.json();
          
          // Enrichir avec les données de notation
          return {
            ...pokemonData,
            rating: ratingsData[id]?.rating || 0,
            numberOfVotes: ratingsData[id]?.numberOfVotes || 0
          };
        } catch (error) {
          console.error(`Error fetching Pokémon ${id}:`, error);
          // Retourner un Pokémon minimal avec ID pour éviter les erreurs
          return {
            id,
            name: `Pokémon #${id}`,
            sprites: {
              front_default: '/placeholder.png',
              other: { 'official-artwork': { front_default: '/placeholder.png' } }
            },
            rating: 0,
            numberOfVotes: 0,
            types: []
          };
        }
      })
    );
    
    return pokemons;
  } catch (error) {
    console.error('Error fetching multiple Pokémons:', error);
    throw error;
  }
}

// Rechercher des Pokémon
export async function searchPokemons(query: string): Promise<Pokemon[]> {
  try {
    const response = await fetch(`/api/pokemons/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error searching Pokémon:', error);
    throw error;
  }
}

// Récupère les détails d'un Pokémon par son ID avec les notes à jour
export async function fetchPokemonById(id: number): Promise<Pokemon> {
  try {
    const res = await fetch(`/api/pokemons/${id}`, {
      // Désactiver le cache pour toujours avoir des données fraîches
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch Pokemon with id ${id}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching Pokemon details:', error);
    throw error;
  }
}