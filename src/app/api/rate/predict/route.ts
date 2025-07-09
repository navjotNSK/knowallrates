import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch from Spring Boot backend
    const backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/rate/predict`, {
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
    console.log("Prediction from backend:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching prediction:", error)

    // Return mock data as fallback
    const trends = ["up", "down", "stable"] as const
    const randomTrend = trends[Math.floor(Math.random() * trends.length)]

    const mockPrediction = {
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      predicted22k: 5875 + (Math.random() - 0.5) * 100,
      predicted24k: 6410 + (Math.random() - 0.5) * 100,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      trend: randomTrend,
    }

    return NextResponse.json(mockPrediction, {
      status: 200,
      headers: {
        "X-Data-Source": "mock-fallback",
      },
    })
  }
}
