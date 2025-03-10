import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 400 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
