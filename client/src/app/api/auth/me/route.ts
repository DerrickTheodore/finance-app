import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:3001";

export async function GET() {
  const cookieStore = await cookies(); // Await cookies()
  const tokenCookie = cookieStore.get("token"); // Use the cookie store instance

  if (!tokenCookie) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    // Forward the request to a protected route on your backend that can verify the user
    // This route should return user information if the token is valid
    const apiRes = await fetch(`${SERVER_API_URL}/api/auth/me`, {
      // Ensure this endpoint exists on your server
      method: "GET",
      headers: {
        // Forward the cookie to the backend server
        Cookie: `token=${tokenCookie.value}`,
      },
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    return NextResponse.json(data, { status: apiRes.status });
  } catch (error) {
    console.error("[API_AUTH_ME_ERROR]", error);
    return NextResponse.json(
      { message: "Error fetching user status" },
      { status: 500 }
    );
  }
}
