import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: { userId: string, pokedexId: string } }) {
  try {
    // Attendre la résolution de context.params
    const params = await context.params;
    const { userId, pokedexId } = params;
    const body = await request.json();
    const { rating } = body;

    // Extraire le token du header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1]; // Extraire le token après "Bearer "

    const response = await fetch(`http://localhost:3001/user/${userId}/rate-pokemon/${pokedexId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Envoie le token au backend NestJS
      },
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
