import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ message: errorText || "Failed to send reset email" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Failed to send reset email" }, { status: 500 })
  }
}
