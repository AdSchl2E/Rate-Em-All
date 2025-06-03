import { NextResponse } from 'next/server';

// Créez un endpoint pour récupérer plusieurs Pokémon à la fois
// api/pokemons/list
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = page * limit;
  
  try {
    // Récupérer la liste des Pokémon avec pagination
    const listResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
      { next: { revalidate: 3600 } } // Cache d'une heure
    );
    
    if (!listResponse.ok) {
      throw new Error(`Error from PokeAPI: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    
    // Récupération en parallèle des détails
    const pokemonDetails = await Promise.all(
      listData.results.map(async (pokemon: any) => {
        const detailResponse = await fetch(pokemon.url, {
          next: { revalidate: 86400 } // Cache d'un jour
        });
        
        if (!detailResponse.ok) {
          console.error(`Failed to fetch details for ${pokemon.name}`);
          return null;
        }
        
        return detailResponse.json();
      })
    );
    
    // Filtrer les nulls
    const validDetails = pokemonDetails.filter(Boolean);
    
    // Récupérer toutes les notes en une seule requête
    const pokedexIds = validDetails.map(p => p.id);
    const ratingsResponse = await fetch(
      `${process.env.API_URL || 'http://localhost:3001'}/pokemons/ratings/batch?ids=${pokedexIds.join(',')}`, 
      { next: { revalidate: 300 } }
    );
    
    let ratingsData = {};
    if (ratingsResponse.ok) {
      ratingsData = await ratingsResponse.json();
    }
    
    // Combiner les données
    const enhancedPokemons = validDetails.map(pokemon => ({
      ...pokemon,
      rating: ratingsData[pokemon.id]?.rating || 0,
      numberOfVotes: ratingsData[pokemon.id]?.numberOfVotes || 0
    }));
    
    return NextResponse.json({
      pokemons: enhancedPokemons,
      hasMore: !!listData.next,
      total: listData.count
    });
  } catch (error) {
    console.error('Error in pokemons/list route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon list' },
      { status: 500 }
    );
  }
}