import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.GOLD_API_BASE_URL || "http://localhost:8080"

// Updated type definition for params
type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params
    const { id } = await params
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/shop/addresses/${id}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ message: errorData.message || "Address not found" }, { status: response.status })
    }

    const address = await response.json()
    return NextResponse.json(address)
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params
    const { id } = await params
    
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

    const response = await fetch(`${BACKEND_URL}/api/shop/addresses/${id}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || "Failed to update address" },
        { status: response.status },
      )
    }

    const address = await response.json()
    return NextResponse.json(address)
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params
    const { id } = await params
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/shop/addresses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || "Failed to delete address" },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}