import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token");

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const plaidItemId = searchParams.get("plaidItemId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const count = searchParams.get("count") || "100";
  const offset = searchParams.get("offset") || "0";
  const account_ids_values = searchParams.getAll("account_ids[]"); // Read "account_ids[]"

  if (!plaidItemId) {
    return NextResponse.json(
      {
        message: "Missing required query parameter: plaidItemId",
      },
      { status: 400 }
    );
  }

  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

    const query = new URLSearchParams({
      plaidItemId,
      count,
      offset,
    });

    // Add optional date parameters if provided
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    // Add account_ids if provided
    account_ids_values.forEach((id) => query.append("account_ids", id)); // Forward as "account_ids" to match server schema

    const response = await fetch(
      `${serverUrl}/api/plaid/transactions?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: `${sessionToken.name}=${sessionToken.value}`, // Include session token in request headers
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching Plaid transactions:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
