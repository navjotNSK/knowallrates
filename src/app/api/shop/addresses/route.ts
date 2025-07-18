import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.GOLD_API_BASE_URL || "http://localhost:8080"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/shop/addresses`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch addresses" },
        { status: response.status },
      )
    }

    const addresses = await response.json()
    return NextResponse.json(addresses, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["fullName", "phoneNumber", "addressLine1", "city", "state", "pincode"]
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === "") {
        return NextResponse.json({ message: `${field} is required` }, { status: 400 })
      }
    }

    // Validate phone number format (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(body.phoneNumber)) {
      return NextResponse.json({ message: "Please enter a valid 10-digit phone number" }, { status: 400 })
    }

    // Validate pincode format
    const pincodeRegex = /^[1-9][0-9]{5}$/
    if (!pincodeRegex.test(body.pincode)) {
      return NextResponse.json({ message: "Please enter a valid 6-digit pincode" }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/api/shop/addresses`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || "Failed to create address" },
        { status: response.status },
      )
    }

    const address = await response.json()
    // return NextResponse.json(address, { status: 201 })
     return NextResponse.json(address, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
