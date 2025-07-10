import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ plaidItemId: string }> }
) {
  const { plaidItemId } = await params; // Access plaidItemId from params first

  if (!plaidItemId) {
    return NextResponse.json(
      { message: "Missing Plaid Item ID in URL path." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies(); // Then, call dynamic functions like cookies()
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

    const response = await fetch(
      `${serverUrl}/api/plaid/items/${plaidItemId}`, // Forward to the Express server
      {
        method: "DELETE",
        headers: {
          Cookie: `${sessionToken.name}=${sessionToken.value}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `[API Client - DELETE /items/:plaidItemId] Error removing item ${plaidItemId}:`,
      error
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
