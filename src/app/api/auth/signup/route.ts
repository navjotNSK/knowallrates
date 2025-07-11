import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Sign up request for email:", body.email)

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/auth/signup`
    console.log("Signing up at backend URL:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    console.log("Backend sign up response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend sign up error:", errorText)
      return NextResponse.json({ message: errorText || "Sign up failed" }, { status: response.status })
    }

    const data = await response.json()
    console.log("Sign up successful for user:", data.user?.email)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json(
      { message: "Sign up failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  })
}
