import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getServerUrl = () =>
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

// POST /api/transactions/:transactionId/categories - Link a category to a transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { transactionId } = await params;

  if (!transactionId) {
    return NextResponse.json(
      { message: "Transaction ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json(); // Expects { categoryId: number }
    const serverUrl = getServerUrl();
    const response = await fetch(
      `${serverUrl}/api/transactions/${transactionId}/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${sessionToken.name}=${sessionToken.value}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CLIENT] Error linking category to transaction:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
