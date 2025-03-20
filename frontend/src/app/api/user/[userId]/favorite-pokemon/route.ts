import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { userId: string } }) {
    try {
        const params = await context.params;
        const { userId } = params;

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Authorization header missing or invalid" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        const response = await fetch(`http://localhost:3001/user/${userId}/favorite-pokemon/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ message: "Failed to get favorite Pokémon", error: errorText }, { status: 400 });
        }

        const data = await response.json();

        return NextResponse.json({ message: "Favorite finded successfully", favorites: data }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
    }
}
