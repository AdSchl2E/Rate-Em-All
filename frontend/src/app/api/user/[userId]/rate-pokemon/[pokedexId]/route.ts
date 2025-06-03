import { NextResponse } from "next/server";
import { API_CONFIG } from "../../../../../../lib/api-config";

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
    
    const token = authHeader.split(" ")[1];

    const response = await fetch(`${API_CONFIG.baseUrl}/user/${userId}/rate-pokemon/${pokedexId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: "Failed to rate Pokémon", error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}
