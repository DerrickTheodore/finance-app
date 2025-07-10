import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies(); // cookies() is a function that returns the cookie store
  const sessionToken = cookieStore.get("token"); // Changed 'connect.sid' to 'token'

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure the server URL is correctly configured, especially for development vs. production
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
    console.log("Server URL:", serverUrl);
    const response = await fetch(`${serverUrl}/api/plaid/create-link-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Add Content-Type header
        Cookie: `${sessionToken.name}=${sessionToken.value}`,
      },
      body: JSON.stringify({}), // Send an empty JSON object
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error creating link token:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
