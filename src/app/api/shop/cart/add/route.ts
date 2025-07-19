import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const body = await request.json()

    console.log(authHeader);

    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }
    
    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/shop/cart/add`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ message: "Failed to add to cart" }, { status: 500 })
  }
}
