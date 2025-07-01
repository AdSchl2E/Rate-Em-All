import { NextRequest, NextResponse } from 'next/server';
import { serverApiRequest } from '@/lib/api/server/base';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET - Retrieves data for a specific Pokemon by its Pokedex ID
 * Including community ratings and user-specific data if authenticated
 * 
 * @param request - The incoming request object
 * @param params - Route parameters containing the pokedexId
 * @returns Pokemon data with ratings and user preferences
 */
export async function GET(
  { params }: { params: { pokedexId: string } }
) {
  const { pokedexId } = params;
  const session = await getServerSession(authOptions);
  
  try {
    // Get basic Pokémon data
    const pokemonData = await serverApiRequest(`/pokemons/pokedexId/${pokedexId}`, {
      cache: 'no-store'
    });
    
    // If user is authenticated, get their specific data
    if (session?.user?.id && session.accessToken) {
      try {
        // Get user's rating for this Pokémon
        const userRatings = await serverApiRequest(`/user/${session.user.id}/ratings`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          },
          cache: 'no-store'
        });
        
        if (userRatings && Array.isArray(userRatings.ratings)) {
          const userRating = userRatings.ratings.find(
            (r: any) => r.pokedexId === parseInt(pokedexId) || r.pokemonId === parseInt(pokedexId)
          );
          
          if (userRating) {
            pokemonData.userRating = userRating.rating;
          }
        }
        
        // Check if Pokémon is in user's favorites
        const favorites = await serverApiRequest(`/user/${session.user.id}/favorite-pokemon`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          },
          cache: 'no-store'
        });
        
        if (favorites && Array.isArray(favorites.favorites)) {
          pokemonData.isFavorite = favorites.favorites.includes(parseInt(pokedexId));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Continue without user data
      }
    }
    
    return NextResponse.json(pokemonData, { status: 200 });
  } catch (error) {
    console.error(`Error fetching Pokémon ${pokedexId}:`, error);
    // Return default values for unknown Pokémon
    return NextResponse.json({ rating: 0, numberOfVotes: 0, userRating: 0 }, { status: 200 });
  }
}