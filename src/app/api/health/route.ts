import { NextResponse } from "next/server"

export async function GET() {
  try {
    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"

    // Remove trailing slash if present
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/rate/health`

    console.log("Health check - Backend URL:", backendUrl)
    console.log("Health check - Full URL:", fullUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    console.log("Health check response status:", response.status)
    console.log("Health check response headers:", Object.fromEntries(response.headers.entries()))

    const backendStatus = response.ok ? "connected" : "disconnected"
    let backendMessage = "Backend not reachable"

    if (response.ok) {
      try {
        backendMessage = await response.text()
      } catch (e) {
        backendMessage = "Connected but response unreadable"
      }
    } else {
      try {
        const errorText = await response.text()
        backendMessage = `HTTP ${response.status}: ${errorText}`
      } catch (e) {
        backendMessage = `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return NextResponse.json({
      frontend: "running",
      backend: backendStatus,
      backendMessage,
      timestamp: new Date().toISOString(),
      backendUrl: backendUrl,
      fullUrl: fullUrl,
      responseStatus: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    })
  } catch (error) {
    console.error("Health check error:", error)

    let errorMessage = "Unknown error"
    if (error instanceof Error) {
      errorMessage = error.message
      if (error.name === "AbortError") {
        errorMessage = "Request timeout (10s)"
      }
    }

    const backendUrl = (process.env.GOLD_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "")

    return NextResponse.json({
      frontend: "running",
      backend: "disconnected",
      error: errorMessage,
      timestamp: new Date().toISOString(),
      backendUrl: backendUrl,
      fullUrl: `${backendUrl}/api/rate/health`,
    })
  }
}
