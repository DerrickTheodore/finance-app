import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getServerUrl = () =>
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

// DELETE /api/transactions/:transactionId/unlink-category/:categoryId - Unlink a category from a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string; categoryId: string }> }
) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { transactionId, categoryId } = await params;

  if (!transactionId || !categoryId) {
    return NextResponse.json(
      { message: "Transaction ID and Category ID are required" },
      { status: 400 }
    );
  }

  try {
    const serverUrl = getServerUrl();
    const response = await fetch(
      `${serverUrl}/api/transactions/${transactionId}/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: `${sessionToken.name}=${sessionToken.value}`,
        },
      }
    );

    if (response.status === 204) {
      // NO_CONTENT
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status }); // Should be 204 if successful
  } catch (error) {
    console.error(
      "[API CLIENT] Error unlinking category from transaction:",
      error
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
