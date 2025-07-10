import { NextResponse } from "next/server";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiRes = await fetch(`${SERVER_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();
    const response = NextResponse.json(data, { status: apiRes.status });

    const setCookieHeader = apiRes.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("[API_AUTH_LOGIN_ERROR]", error);
    return NextResponse.json({ message: "Error logging in" }, { status: 500 });
  }
}
