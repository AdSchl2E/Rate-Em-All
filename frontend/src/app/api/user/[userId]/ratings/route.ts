import { NextResponse } from "next/server";
import { API_CONFIG } from "../../../../../lib/api-config";
import { headers } from "next/headers";

export async function GET(request: Request, context: { params: { userId: string } }) {
  try {
    // Corriger l'erreur d'API asynchrone avec await
    const { userId } = await Promise.resolve(context.params);
    console.log(`[Server] Fetching ratings for user ${userId}...`);

    // Extraire le token du header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    console.log(`[Server] Got token, calling backend API for user ${userId} ratings`);

    const response = await fetch(`${API_CONFIG.baseUrl}/user/${userId}/ratings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store"
    });

    const responseText = await response.text();
    console.log(`[Server] Backend response: ${response.status} ${response.statusText}`);
    console.log(`[Server] Response body: ${responseText}`);

    if (!response.ok) {
      console.error(`[Server] Backend error: ${response.status}`);
      return NextResponse.json({ message: "Failed to get user ratings", error: responseText }, { status: response.status });
    }

    try {
      // Essayer de parser le JSON de la réponse
      const data = JSON.parse(responseText);
      console.log(`[Server] Successfully parsed ratings data`);
      return NextResponse.json(data, { status: 200 });
    } catch (parseError) {
      console.error(`[Server] Error parsing response as JSON:`, parseError);
      return NextResponse.json({ message: "Invalid JSON response from backend" }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Server] Unhandled error:`, errorMessage);
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: { userId: string } }) {
  try {
    // Corriger l'erreur d'API asynchrone avec await
    const { userId } = await Promise.resolve(context.params);
    console.log(`[Server] Rating Pokémon for user ${userId}...`);

    // Récupérer le corps de la requête
    const body = await request.json();
    const { pokedexId, rating } = body;
    
    if (!pokedexId || typeof rating !== 'number') {
      console.error(`[Server] Invalid request body:`, body);
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // Extraire le token du header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    console.log(`[Server] Rating Pokémon ${pokedexId} with score ${rating} for user ${userId}`);

    // Appel à l'API backend
    const response = await fetch(`${API_CONFIG.baseUrl}/user/${userId}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        pokedexId,
        rating
      })
    });

    const responseText = await response.text();
    console.log(`[Server] Backend response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`[Server] Backend error: ${response.status} - ${responseText}`);
      return NextResponse.json({ message: "Failed to rate Pokémon", error: responseText }, { status: response.status });
    }

    try {
      // Essayer de parser le JSON de la réponse
      const data = JSON.parse(responseText || '{}');
      console.log(`[Server] Successfully rated Pokémon`);
      return NextResponse.json(data, { status: 200 });
    } catch (parseError) {
      console.error(`[Server] Error parsing response as JSON:`, parseError);
      // Si le texte est vide, renvoyez simplement un succès
      if (!responseText) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json({ message: "Invalid JSON response from backend" }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Server] Unhandled error:`, errorMessage);
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}