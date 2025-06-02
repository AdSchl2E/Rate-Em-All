import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Fetching top-rated Pokémon from backend...");
    const response = await fetch(`http://localhost:3001/pokemons/top-rated`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Désactiver le cache
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { message: "Failed to fetch top rated Pokémon", error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Received ${data.length} top-rated Pokémon from backend`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Route error: ${errorMessage}`);
    return NextResponse.json(
      { message: "Server error", error: errorMessage },
      { status: 500 }
    );
  }
}