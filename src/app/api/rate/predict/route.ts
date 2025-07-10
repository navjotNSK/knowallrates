import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Remove trailing slash from backend URL
    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/rate/predict`

    console.log("Fetching prediction from backend URL:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      cache: "no-store",
    })

    console.log("Backend prediction response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend prediction error response:", errorText)
      throw new Error(`Backend API responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Backend prediction response data:", data)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Error fetching prediction:", error)

    // Return mock data as fallback
    const trends = ["up", "down", "stable"] as const
    const randomTrend = trends[Math.floor(Math.random() * trends.length)]

    const mockPrediction = {
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      predicted22k: 5875 + (Math.random() - 0.5) * 100,
      predicted24k: 6410 + (Math.random() - 0.5) * 100,
      confidence: Math.floor(Math.random() * 30) + 70,
      trend: randomTrend,
    }

    return NextResponse.json(mockPrediction, {
      status: 200,
      headers: {
        "X-Data-Source": "mock-fallback",
        "X-Error": error instanceof Error ? error.message : "Unknown error",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}
