import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Received request at /api/auth/signup");
    const body = await req.json();
    console.log("Request body:", body);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend Error:", errorText);
      return NextResponse.json({ error: "Signup failed", details: errorText }, { status: 400 });
    }

    const user = await response.json();
    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    console.error("Internal Server Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
  }
}
