import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: { pokemonId: string | Promise<string> } }) {
  try {
    // Attendre la résolution de context.params
    const params = await context.params;
    const pokemonId = await params.pokemonId;
    const body = await request.json();
    const { rating } = body;

    const response = await fetch(`http://localhost:3001/pokemons/${pokemonId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: "Failed to rate Pokémon", error: errorText }, { status: 400 });
    }

    return NextResponse.json({ message: "Rating saved successfully" }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}