import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Route simplifiée pour l'inscription - simple proxy vers le backend
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Simple proxy vers le backend
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
