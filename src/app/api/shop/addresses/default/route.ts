import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.GOLD_API_BASE_URL || "http://localhost:8080"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/shop/addresses/default`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return NextResponse.json({ message: "No default address found" }, { status: 404 })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch default address" },
        { status: response.status },
      )
    }

    const address = await response.json()
    return NextResponse.json(address)
  } catch (error) {
    console.error("Error fetching default address:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
