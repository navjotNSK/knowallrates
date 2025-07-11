import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      console.log("No authorization header provided")
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/auth/profile`
    console.log("Fetching profile from backend URL:", fullUrl)

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

    console.log("Backend profile response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend profile error:", errorText)
      return NextResponse.json({ message: "Failed to fetch profile" }, { status: response.status })
    }

    const data = await response.json()
    console.log("Profile fetched for user:", data.email)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { message: "Failed to fetch profile", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const body = await request.json()

    if (!authHeader) {
      console.log("No authorization header provided")
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const fullUrl = `${backendUrl}/api/auth/profile`
    console.log("Updating profile at backend URL:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "KnowAllRates-Frontend/1.0",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    console.log("Backend profile update response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend profile update error:", errorText)
      return NextResponse.json({ message: "Failed to update profile" }, { status: response.status })
    }

    const data = await response.json()
    console.log("Profile updated for user:", data.email)

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { message: "Failed to update profile", error: error instanceof Error ? error.message : "Unknown error" },
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
