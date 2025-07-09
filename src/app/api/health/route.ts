import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Spring Boot backend is running
    const backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/rate/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    const backendStatus = response.ok ? "connected" : "disconnected"
    const backendMessage = response.ok ? await response.text() : "Backend not reachable"

    return NextResponse.json({
      frontend: "running",
      backend: backendStatus,
      backendMessage,
      timestamp: new Date().toISOString(),
      backendUrl,
    })
  } catch (error) {
    return NextResponse.json({
      frontend: "running",
      backend: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      backendUrl: process.env.GOLD_API_BASE_URL || "http://localhost:8080",
    })
  }
}
