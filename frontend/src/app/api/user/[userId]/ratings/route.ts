import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { userId: string } }) {
  try {
    console.log(`Fetching ratings for user ${context.params.userId}...`);
    const params = await context.params;
    const { userId } = params;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];

    const response = await fetch(`http://localhost:3001/user/${userId}/ratings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store" // Désactiver le cache
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json({ message: "Failed to get user ratings", error: errorText }, { status: 400 });
    }

    const data = await response.json();
    console.log(`Received ratings for ${data.ratings?.length || 0} Pokémon`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Route error: ${errorMessage}`);
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}