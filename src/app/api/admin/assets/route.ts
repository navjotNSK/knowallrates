import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      console.log("No authorization header provided for /api/admin/assets")
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/admin/assets`
    console.log("Proxying GET /api/admin/assets to backend URL:", fullUrl)
    console.log("Using auth header:", authHeader.substring(0, 20) + "...")

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      cache: "no-store",
    })

    console.log("Backend response status for /api/admin/assets:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error response for /api/admin/assets:", errorText)
      return NextResponse.json(
        { message: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Assets data received from backend:", data)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Frontend proxy error for /api/admin/assets:", error)
    return NextResponse.json(
      {
        message: "Failed to fetch assets via frontend proxy",
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
