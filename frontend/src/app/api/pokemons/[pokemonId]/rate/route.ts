import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { pokemonId: string } }) {
  try {
    const body = await request.json();
    const { rating } = body;
    const { pokemonId } = params;

    const response = await fetch(`http://localhost:3001/pokemon/${pokemonId}/rate/${rating}`, {
      method: "POST",
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