import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get backend URL from environment
    const backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    const fullUrl = `${backendUrl}/api/rate/today`

    console.log("Fetching from backend URL:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      // Remove timeout for Railway
      cache: "no-store",
    })

    console.log("Backend response status:", response.status)
    console.log("Backend response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error response:", errorText)
      throw new Error(`Backend API responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Backend response data:", data)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Error fetching today rates:", error)

    // Return mock data as fallback
    const mockData = {
      date: new Date().toISOString().split("T")[0],
      gold22k: 5850 + Math.random() * 50,
      gold24k: 6380 + Math.random() * 50,
      change22k: (Math.random() - 0.5) * 50,
      change24k: (Math.random() - 0.5) * 50,
      changePercent22k: (Math.random() - 0.5) * 2,
      changePercent24k: (Math.random() - 0.5) * 2,
      timestamp: new Date().toISOString(),
      yesterday: {
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        gold22k: 5825,
        gold24k: 6350,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    }

    return NextResponse.json(mockData, {
      status: 200,
      headers: {
        "X-Data-Source": "mock-fallback",
        "X-Error": error instanceof Error ? error.message : "Unknown error",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}
