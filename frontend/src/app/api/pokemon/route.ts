import { NextRequest, NextResponse } from 'next/server';
import { serverApiRequest, serverPokeApiRequest } from '@/lib/api/server/base';
import { API_CONFIG } from '@/lib/api/shared/config';

// List Pokémon with filtering and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'list';
  
  // Handle different types of Pokémon listings
  switch (action) {
    case 'list': {
      // Check if specific IDs were requested
      const specificIds = searchParams.get('ids');
      if (specificIds) {
        try {
          const ids = specificIds.split(',').map(id => parseInt(id.trim()));
          const validIds = ids.filter(id => !isNaN(id));
          
          if (validIds.length === 0) {
            return NextResponse.json({ pokemons: [] });
          }
          
          // Fetch details for each requested Pokemon
          const detailsPromises = validIds.map(async (id) => {
            try {
              const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
              const response = await fetch(url, {
                next: API_CONFIG.cacheConfig.medium
              });
              
              if (!response.ok) return null;
              return response.json();
            } catch (error) {
              console.error(`Error fetching Pokemon ${id}:`, error);
              return null;
            }
          });
          
          const pokemonDetails = await Promise.all(detailsPromises);
          const validDetails = pokemonDetails.filter(Boolean);
          
          // Get ratings for all Pokémon
          const pokedexIds = validDetails.map((p: any) => p.id);
          
          if (pokedexIds.length > 0) {
            const ratingsData = await serverApiRequest(`/pokemons/ratings/batch`, {
              params: { ids: pokedexIds.join(',') },
              cache: 'no-store'
            });
            
            // Combine Pokémon details with ratings
            const enhancedPokemons = validDetails.map((pokemon: any) => ({
              ...pokemon,
              rating: ratingsData[pokemon.id]?.rating || 0,
              numberOfVotes: ratingsData[pokemon.id]?.numberOfVotes || 0
            }));
            
            return NextResponse.json({
              pokemons: enhancedPokemons
            });
          }
          
          return NextResponse.json({
            pokemons: validDetails
          });
        } catch (error) {
          console.error('Error fetching Pokemon by IDs:', error);
          return NextResponse.json(
            { error: 'Failed to fetch Pokemon by IDs' },
            { status: 500 }
          );
        }
      }
      
      // Continue with the existing pagination logic if no IDs were specified
      const page = parseInt(searchParams.get('page') || '0');
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = page * limit;
      
      try {
        // Get basic Pokémon list from PokeAPI
        const pokemonList = await serverPokeApiRequest(`/pokemon?limit=${limit}&offset=${offset}`);
        
        if (!pokemonList) {
          return NextResponse.json({ error: 'Failed to fetch Pokémon list' }, { status: 500 });
        }
        
        // Get details for each Pokémon
        const detailsPromises = pokemonList.results.map(async (pokemon: any) => {
          try {
            const response = await fetch(pokemon.url, {
              next: API_CONFIG.cacheConfig.long
            });
            
            if (!response.ok) return null;
            return response.json();
          } catch (error) {
            console.error(`Error fetching ${pokemon.name}:`, error);
            return null;
          }
        });
        
        const pokemonDetails = await Promise.all(detailsPromises);
        const validDetails = pokemonDetails.filter(Boolean);
        
        // Get ratings for all Pokémon
        const pokedexIds = validDetails.map((p: any) => p.id);
        
        if (pokedexIds.length > 0) {
          const ratingsData = await serverApiRequest(`/pokemons/ratings/batch`, {
            params: { ids: pokedexIds.join(',') },
            cache: 'no-store' // Toujours des données fraîches
          });
          
          // Combine Pokémon details with ratings
          const enhancedPokemons = validDetails.map((pokemon: any) => ({
            ...pokemon,
            rating: ratingsData[pokemon.id]?.rating || 0,
            numberOfVotes: ratingsData[pokemon.id]?.numberOfVotes || 0
          }));
          
          return NextResponse.json({
            pokemons: enhancedPokemons,
            hasMore: !!pokemonList.next,
            total: pokemonList.count
          });
        }
        
        return NextResponse.json({
          pokemons: validDetails,
          hasMore: !!pokemonList.next,
          total: pokemonList.count
        });
      } catch (error) {
        console.error('Error fetching Pokémon list:', error);
        return NextResponse.json(
          { error: 'Failed to fetch Pokémon list' },
          { status: 500 }
        );
      }
    }
    
    case 'alternate-forms': {
      const limit = parseInt(searchParams.get('limit') || '1000');
      const offset = parseInt(searchParams.get('offset') || '898');
      
      try {
        const data = await serverPokeApiRequest(`/pokemon?limit=${limit}&offset=${offset}`);
        
        if (!data) {
          return NextResponse.json({ error: 'Failed to fetch alternate forms' }, { status: 500 });
        }
        
        // Get details for each form
        const formDetailsPromises = data.results.map(async (pokemon: any) => {
          try {
            const detailResponse = await fetch(pokemon.url, {
              next: API_CONFIG.cacheConfig.long
            });
            
            if (!detailResponse.ok) return null;
            return detailResponse.json();
          } catch (error) {
            console.error(`Error fetching ${pokemon.name}:`, error);
            return null;
          }
        });
        
        const formDetails = await Promise.all(formDetailsPromises);
        const validForms = formDetails.filter(Boolean);
        
        return NextResponse.json({ pokemons: validForms }, { status: 200 });
      } catch (error) {
        console.error('Error fetching alternate forms:', error);
        return NextResponse.json({ error: 'Failed to fetch alternate forms' }, { status: 500 });
      }
    }
    
    case 'top-rated': {
      try {
        const data = await serverApiRequest('/pokemons/top-rated', {
          cache: 'no-store' // Toujours des données fraîches
        });
        
        return NextResponse.json(data);
      } catch (error) {
        console.error('Error fetching top-rated Pokémon:', error);
        return NextResponse.json({ error: 'Failed to fetch top-rated Pokémon' }, { status: 500 });
      }
    }
    
    case 'trending': {
      try {
        const data = await serverApiRequest('/pokemons/trending', {
          cache: 'no-store' // Toujours des données fraîches
        });
        
        return NextResponse.json(data);
      } catch (error) {
        console.error('Error fetching trending Pokémon:', error);
        return NextResponse.json({ error: 'Failed to fetch trending Pokémon' }, { status: 500 });
      }
    }
    
    case 'search': {
      const query = searchParams.get('q')?.toLowerCase();
      
      if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
      }
      
      try {
        // Get list of all Pokémon
        const data = await serverPokeApiRequest('/pokemon?limit=1500');
        
        if (!data) {
          return NextResponse.json({ error: 'Failed to fetch Pokémon for search' }, { status: 500 });
        }
        
        // Filter Pokémon by name
        const filteredResults = data.results.filter(
          (pokemon: any) => pokemon.name.toLowerCase().includes(query)
        ).slice(0, 20); // Limit to 20 results
        
        if (!filteredResults.length) {
          return NextResponse.json({ pokemons: [] });
        }
        
        // Get details for each filtered Pokémon
        const pokemonDetailsPromises = filteredResults.map(async (pokemon: any) => {
          try {
            const detailResponse = await fetch(pokemon.url, {
              next: { revalidate: 86400 }
            });
            
            if (!detailResponse.ok) {
              return null;
            }
            
            return detailResponse.json();
          } catch (error) {
            return null;
          }
        });
        
        const pokemonDetails = await Promise.all(pokemonDetailsPromises);
        const validDetails = pokemonDetails.filter(Boolean);
        
        return NextResponse.json({ pokemons: validDetails });
      } catch (error) {
        console.error('Error searching Pokémon:', error);
        return NextResponse.json({ error: 'Failed to search Pokémon' }, { status: 500 });
      }
    }
    
    case 'count': {
      try {
        const data = await serverPokeApiRequest('/pokemon/?limit=1');
        
        if (!data) {
          return NextResponse.json({ count: 1500 }, { status: 200 });
        }
        
        return NextResponse.json({ count: data.count }, { status: 200 });
      } catch (error) {
        console.error('Error getting Pokémon count:', error);
        return NextResponse.json({ count: 1500 }, { status: 200 });
      }
    }
    
    case 'metadata': {
      const limit = parseInt(searchParams.get('limit') || '1500');
      
      try {
        // Utiliser l'API PokeAPI pour récupérer les métadonnées minimales
        const response = await serverPokeApiRequest(`/pokemon?limit=${limit}`);
        
        if (!response?.results) {
          return NextResponse.json({ error: 'Failed to fetch Pokemon metadata' }, { status: 500 });
        }

        // Transformer les résultats en métadonnées légères
        const metadata = await Promise.all(
          response.results.map(async (pokemon: any) => {
            const id = parseInt(pokemon.url.split('/').filter(Boolean).pop() || '0');
            
            // Pour les types, nous devons faire une requête supplémentaire mais légère
            // Nous limitons cela aux premiers 100 Pokémon pour l'affichage initial
            let types = [];
            if (id <= 100) { // Limiter les requêtes pour les types
              try {
                const details = await serverPokeApiRequest(`/pokemon/${id}`);
                types = details.types || [];
              } catch (err) {
                // Ignorer les erreurs, on utilisera un tableau vide
              }
            }
            
            return {
              id,
              name: pokemon.name,
              sprites: {
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
              },
              types,
              // Ajouter des champs par défaut pour éviter les erreurs
              rating: 0,
              numberOfVotes: 0
            };
          })
        );
        
        return NextResponse.json(metadata);
      } catch (error) {
        console.error('Error fetching Pokemon metadata:', error);
        return NextResponse.json({ error: 'Failed to fetch Pokemon metadata' }, { status: 500 });
      }
    }
    
    case 'batch': {
      const ids = searchParams.get('ids')?.split(',');
      
      if (!ids || ids.length === 0) {
        return NextResponse.json({ error: 'Aucun ID de Pokémon fourni' }, { status: 400 });
      }
      
      try {
        // Récupérer les ratings en batch depuis le backend
        const ratingsData = await serverApiRequest(`/pokemons/ratings/batch`, {
          params: { ids: ids.join(',') },
          cache: 'no-store' // Toujours des données fraîches
        });
        
        return NextResponse.json(ratingsData);
      } catch (error) {
        console.error('Error fetching batch ratings:', error);
        return NextResponse.json({ error: 'Impossible de récupérer les évaluations par lot' }, { status: 500 });
      }
    }
    
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  
}