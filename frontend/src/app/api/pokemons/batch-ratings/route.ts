import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../lib/api-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    
    if (!ids) {
      return NextResponse.json({}, { status: 400 });
    }
    
    console.log(`Fetching batch ratings for Pokémon IDs: ${ids}`);
    
    // Appel direct à l'API backend
    const response = await fetch(`${API_CONFIG.baseUrl}/pokemons/ratings/batch?ids=${ids}`, {
      next: API_CONFIG.cacheConfig.short
    });
    
    if (!response.ok) {
      // Si le endpoint n'existe pas dans le backend, on crée une réponse simulée
      if (response.status === 404) {
        console.warn("Backend endpoint /pokemons/ratings/batch not found, using fallback");
        
        // Simulation de réponse pour chaque ID demandé
        const idArray = ids.split(',').map(id => parseInt(id.trim()));
        const result: Record<string, { rating: number, numberOfVotes: number }> = {};
        
        for (const id of idArray) {
          // Tenter de récupérer les données individuellement
          try {
            const individualResponse = await fetch(`${API_CONFIG.baseUrl}/pokemons/pokedexId/${id}`, {
              next: API_CONFIG.cacheConfig.short
            });
            
            if (individualResponse.ok) {
              const data = await individualResponse.json();
              result[id] = {
                rating: data.rating || 0,
                numberOfVotes: data.numberOfVotes || 0
              };
            } else {
              result[id] = { rating: 0, numberOfVotes: 0 };
            }
          } catch {
            result[id] = { rating: 0, numberOfVotes: 0 };
          }
        }
        
        return NextResponse.json(result);
      }
      
      // Si autre erreur que 404
      console.error(`Error fetching batch ratings: ${response.status}`);
      return NextResponse.json({}, { status: 500 });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching batch ratings:", error);
    return NextResponse.json({}, { status: 500 });
  }
}