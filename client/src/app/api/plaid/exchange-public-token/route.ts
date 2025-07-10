import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies(); // cookies() is a function that returns the cookie store
  const sessionToken = cookieStore.get("token"); // Changed 'connect.sid' to 'token'

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Log the raw request body text first
    const rawRequestBody = await request.text();
    console.log(
      "[Client API - exchange-public-token] Raw request body:",
      rawRequestBody
    );

    // Then attempt to parse it
    const body = JSON.parse(rawRequestBody);
    const { public_token, metadata } = body;

    console.log(
      "[Client API - exchange-public-token] Parsed metadata:",
      JSON.stringify(metadata, null, 2)
    ); // Added log

    if (!public_token) {
      return NextResponse.json(
        { message: "Public token is required" },
        { status: 400 }
      );
    }

    // Ensure the server URL is correctly configured
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
    const response = await fetch(
      `${serverUrl}/api/plaid/exchange-public-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${sessionToken.name}=${sessionToken.value}`,
        },
        body: JSON.stringify({ public_token, metadata }), // Forward metadata as well
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error exchanging public token:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
