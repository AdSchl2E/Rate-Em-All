import { NextRequest, NextResponse } from 'next/server';
import { serverApiRequest } from '@/lib/api/server/base';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { pokedexId: string } }
) {
  const { pokedexId } = params;
  const searchParams = request.nextUrl.searchParams;
  const session = await getServerSession(authOptions);
  
  try {
    // Get basic Pokémon data
    const pokemonData = await serverApiRequest(`/pokemons/pokedexId/${pokedexId}`, {
      cache: 'no-store'
    });
    
    // Si l'utilisateur est connecté, récupérer ses données spécifiques
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