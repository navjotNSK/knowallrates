import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params
    console.log("Frontend API: Verifying reset token:", token.substring(0, 10) + "...")

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/auth/verify-reset-token/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      cache: "no-store",
    })

    console.log("Backend verify token response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Backend verify token error:", errorData)
      return NextResponse.json(
        { valid: false, message: errorData.message || "Token verification failed" },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Token verification result:", data.valid)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Frontend verify token error:", error)
    return NextResponse.json(
      {
        valid: false,
        message: "Token verification failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
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
