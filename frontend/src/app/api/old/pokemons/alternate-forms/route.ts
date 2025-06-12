import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../lib/api-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '898');
    
    console.log(`Fetching alternate Pokémon forms from ${offset} with limit ${limit}`);
    
    // Récupérer les formes alternatives, en commençant par l'ID après les Pokémon principaux
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`, {
      next: API_CONFIG.cacheConfig.long
    });
    
    if (!response.ok) {
      throw new Error(`Error from PokeAPI: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Récupérer les détails pour chaque forme
    const formDetails = await Promise.all(
      data.results.map(async (pokemon: any) => {
        try {
          const detailResponse = await fetch(pokemon.url, {
            next: API_CONFIG.cacheConfig.long
          });
          
          if (!detailResponse.ok) {
            console.error(`Failed to fetch details for ${pokemon.name}`);
            return null;
          }
          
          return detailResponse.json();
        } catch (error) {
          console.error(`Error fetching ${pokemon.name}:`, error);
          return null;
        }
      })
    );
    
    // Filtrer les nulls et formater les données
    const validForms = formDetails.filter(form => form !== null);
    
    return NextResponse.json({ pokemons: validForms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching alternate forms:", error);
    return NextResponse.json({ error: 'Failed to fetch alternate forms', pokemons: [] }, { status: 500 });
  }
}