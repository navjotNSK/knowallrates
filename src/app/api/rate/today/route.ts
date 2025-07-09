import { NextResponse } from "next/server"
// import { AbortSignal } from "abort-controller"

export async function GET() {
  try {
    // Fetch from Spring Boot backend
    const backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/rate/today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Add timeout and error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Log for debugging
    console.log("Today rates from backend:", data)

    return NextResponse.json(data)
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
      },
    })
  }
}
