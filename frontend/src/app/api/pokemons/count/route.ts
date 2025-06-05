import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../lib/api-config';

export async function GET() {
  try {
    // Utiliser l'endpoint pokemon au lieu de pokemon-species pour avoir toutes les formes
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1', {
      next: API_CONFIG.cacheConfig.long
    });
    
    if (!response.ok) {
      throw new Error(`Error from PokeAPI: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the total count of all Pokémon forms
    return NextResponse.json({ count: data.count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Pokémon count:", error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon count', count: 1500 },
      { status: 500 }
    );
  }
}