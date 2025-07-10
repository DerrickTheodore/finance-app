import { NextResponse } from "next/server";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:3001"; // Ensure your server port is correct

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiRes = await fetch(`${SERVER_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    // Forward the status code from the backend server
    const response = NextResponse.json(data, { status: apiRes.status });

    // Forward any set-cookie headers from the backend server
    // This is crucial for JWT cookies to be set on the browser
    const setCookieHeader = apiRes.headers.get("set-cookie");
    if (setCookieHeader) {
      // The header might contain multiple cookies, ensure they are handled correctly
      // For simplicity, this example assumes a single cookie or that NextResponse handles arrays.
      // In more complex scenarios, you might need to parse and set them individually if NextResponse doesn't handle an array.
      response.headers.set("set-cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("[API_AUTH_SIGNUP_ERROR]", error);
    return NextResponse.json({ message: "Error signing up" }, { status: 500 });
  }
}
