import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { serverApiRequest } from '@/lib/api';

/**
 * Route simplifiée - Récupère un Pokemon par son ID avec données utilisateur si authentifié
 */
export async function GET(
  { params }: { params: { pokedexId: string } }
) {
  const { pokedexId } = params;
  const session = await getServerSession(authOptions);
  
  try {
    // Récupération des données Pokemon de base
    const pokemonData = await serverApiRequest(`/pokemons/pokedexId/${pokedexId}`, {
      cache: 'no-store'
    });
    
    // Si utilisateur connecté, récupérer ses données spécifiques
    if (session?.user?.id && session.accessToken) {
      try {
        // Notes utilisateur
        const userRatings = await serverApiRequest(`/user/${session.user.id}/ratings`, {
          headers: { 'Authorization': `Bearer ${session.accessToken}` },
          cache: 'no-store'
        });
        
        // Trouver la note pour ce Pokemon
        if (userRatings?.ratings?.length) {
          const userRating = userRatings.ratings.find(
            (r: any) => r.pokedexId === parseInt(pokedexId) || r.pokemonId === parseInt(pokedexId)
          );
          if (userRating) pokemonData.userRating = userRating.rating;
        }
        
        // Favoris utilisateur
        const favorites = await serverApiRequest(`/user/${session.user.id}/favorite-pokemon`, {
          headers: { 'Authorization': `Bearer ${session.accessToken}` },
          cache: 'no-store'
        });
        
        if (favorites?.favorites?.length) {
          pokemonData.isFavorite = favorites.favorites.includes(parseInt(pokedexId));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    
    return NextResponse.json(pokemonData);
  } catch (error) {
    console.error(`Error fetching Pokemon ${pokedexId}:`, error);
    return NextResponse.json({ rating: 0, numberOfVotes: 0, userRating: 0 });
  }
}