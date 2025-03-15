import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    context: { params: { pokemonId: string | Promise<string> } }
  ) {
    try {
      // On attend la résolution de context.params
      const params = await context.params;
      const pokemonId = await params.pokemonId;
  
      // Appel au backend pour récupérer les données du Pokémon
      const res = await fetch(`http://localhost:3001/pokemons/pokedexId/${pokemonId}`);
  
      // Si le backend renvoie 404, c'est que le Pokémon n'est pas noté, donc on renvoie des valeurs par défaut
      if (res.status === 404) {
        return NextResponse.json({ rating: 0, numberOfVotes: 0 }, { status: 200 });
      }
  
      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { message: "Failed to fetch Pokémon", error: errorText },
          { status: res.status }
        );
      }
  
      const data = await res.json();
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { message: "Server error", error: errorMessage },
        { status: 500 }
      );
    }
  }
  
  