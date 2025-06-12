import { NextResponse } from "next/server";
import { API_CONFIG } from "../../../../../../lib/api-config";

export async function POST(request: Request, context: { params: { userId: string, pokedexId: string } }) {
  try {
    console.log("API route: Toggling favorite Pokémon...");
    const params = await context.params;
    const { userId, pokedexId } = params;
    
    console.log(`Request to toggle favorite for userId=${userId}, pokedexId=${pokedexId}`);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];

    const response = await fetch(`${API_CONFIG.baseUrl}/user/${userId}/favorite-pokemon/${pokedexId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json({ message: "Failed to update favorite status", error: errorText }, { status: response.status });
    }

    const data = await response.json();
    console.log(`Response from backend:`, data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Route error: ${errorMessage}`);
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}