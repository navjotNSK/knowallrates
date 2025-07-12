import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = searchParams.get("days") || "10"

    // Remove trailing slash from backend URL
    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/rate/history?days=${days}`

    console.log("Fetching history from backend URL:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      cache: "no-store",
    })

    console.log("Backend history response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend history error response:", errorText)
      throw new Error(`Backend API responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Backend history response data size:", data.rates?.length || 0)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
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
          "X-Error": error instanceof Error ? error.message : "Unknown error",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
}
