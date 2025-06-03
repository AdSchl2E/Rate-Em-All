import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../lib/api-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase();
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  try {
    // Récupérer la liste complète (limitée à 1000 pour des raisons pratiques)
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000', {
      next: API_CONFIG.cacheConfig.long
    });
    
    if (!response.ok) {
      throw new Error(`PokeAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filtrer les résultats par nom
    const filteredResults = data.results.filter(
      (pokemon: any) => pokemon.name.toLowerCase().includes(query)
    ).slice(0, 20); // Limiter à 20 résultats
    
    if (!filteredResults.length) {
      return NextResponse.json({ pokemons: [] });
    }
    
    // Récupérer les détails pour chaque Pokémon filtré
    const pokemonDetails = await Promise.all(
      filteredResults.map(async (pokemon: any) => {
        const detailResponse = await fetch(pokemon.url, {
          next: { revalidate: 86400 }
        });
        
        if (!detailResponse.ok) {
          return null;
        }
        
        return detailResponse.json();
      })
    );
    
    const validDetails = pokemonDetails.filter(Boolean);
    
    return NextResponse.json({ pokemons: validDetails });
    
  } catch (error) {
    console.error('Error in search route:', error);
    return NextResponse.json(
      { error: 'Failed to search Pokémon' },
      { status: 500 }
    );
  }
}