import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getServerUrl = () =>
  process.env.SERVER_API_URL || "http://localhost:8000";

// GET /api/categories/:categoryId - Get a specific category by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params; // Extract categoryId from context
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!categoryId) {
    return NextResponse.json(
      { message: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/categories/${categoryId}`, {
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
    console.error("[API CLIENT] Error fetching category by ID:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/:categoryId - Update a specific category
export async function PUT(
  request: NextRequest, // Corrected: _request to request to match usage
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { categoryId } = await params;

  if (!categoryId) {
    return NextResponse.json(
      { message: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/categories/${categoryId}`, {
      method: "PUT",
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
    console.error("[API CLIENT] Error updating category:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/:categoryId - Delete a specific category
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { categoryId } = await params;

  if (!categoryId) {
    return NextResponse.json(
      { message: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        Cookie: `${sessionToken.name}=${sessionToken.value}`,
      },
    });

    if (response.status === 204) {
      // NO_CONTENT
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    // Should be 204 if successful, but if server sends JSON on delete (which it shouldn't for 204)
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CLIENT] Error deleting category:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
