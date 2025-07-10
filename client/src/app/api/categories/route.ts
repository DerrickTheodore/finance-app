import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getServerUrl = () =>
  process.env.SERVER_API_URL || "http://localhost:8000";

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${sessionToken.name}=${sessionToken.value}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CLIENT] Error creating category:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET /api/categories - Get all categories for the user
export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/categories`, {
      method: "GET",
      headers: {
        Cookie: `${sessionToken.name}=${sessionToken.value}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CLIENT] Error fetching categories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
