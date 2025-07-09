import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = searchParams.get("days") || "10"

    // Fetch from Spring Boot backend
    const backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/rate/history?days=${days}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Log for debugging
    console.log("History rates from backend:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching history rates:", error)

    // Return mock data as fallback
    const days = Number.parseInt(request.nextUrl.searchParams.get("days") || "10")
    const rates = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
      gold22k: 5800 + Math.random() * 100,
      gold24k: 6300 + Math.random() * 100,
    })).reverse()

    return NextResponse.json(
      { rates },
      {
        status: 200,
        headers: {
          "X-Data-Source": "mock-fallback",
        },
      },
    )
  }
}
