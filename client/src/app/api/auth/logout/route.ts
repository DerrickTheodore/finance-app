import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:3001";

export async function POST(request: Request) {
  const cookieStore = await cookies(); // Await cookies()

  try {
    // Forward the logout request to the backend server
    // The backend server should be responsible for invalidating the cookie (e.g., by setting its max-age to 0)
    const apiRes = await fetch(`${SERVER_API_URL}/api/auth/logout`, {
      method: "POST",
      // Forward existing cookies from the client to the backend
      // so the backend knows which session/cookie to invalidate.
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    });

    const data = await apiRes.json();
    const response = NextResponse.json(data, { status: apiRes.status });

    // The backend server should send back a 'set-cookie' header that clears the cookie.
    // We forward that header to the client.
    const setCookieHeader = apiRes.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    } else {
      cookieStore.delete("token");
    }

    return response;
  } catch (error) {
    console.error("[API_AUTH_LOGOUT_ERROR]", error);
    cookieStore.delete("token");
    return NextResponse.json({ message: "Error logging out" }, { status: 500 });
  }
}
