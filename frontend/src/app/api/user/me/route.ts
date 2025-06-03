import { NextResponse } from "next/server";
import { API_CONFIG } from "../../../../lib/api-config";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/user/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch user" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to fetch user data", details: errorMessage }, { status: 500 });
  }
}
