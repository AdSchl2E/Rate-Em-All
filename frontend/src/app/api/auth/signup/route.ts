import { NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/api/shared/config";

export async function POST(req: Request) {
  try {
    console.log("Received request at /api/auth/signup");
    const body = await req.json();
    console.log("Request body:", body);

    // Use API_CONFIG for base URL
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend Error:", errorText);
      return NextResponse.json({ error: "Signup failed", details: errorText }, { status: response.status });
    }

    const user = await response.json();
    console.log("User signed up successfully:", user);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Internal Server Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}
