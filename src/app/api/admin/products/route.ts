import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/admin/products`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend responded with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching admin products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }

    const formData = await request.formData()

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/admin/products`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        // Do NOT set Content-Type for FormData, browser sets it automatically with boundary
      },
      body: formData, // Pass the FormData directly
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend responded with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.pathname.split("/").pop() // Extract product ID from URL

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    const formData = await request.formData()

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/admin/products/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend responded with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.pathname.split("/").pop() // Extract product ID from URL

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/admin/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend responded with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }

    const url = new URL(request.url)
    const parts = url.pathname.split("/")
    const productId = parts[parts.length - 2] // Get product ID from /api/admin/products/{id}/status
    const body = await request.json()

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/admin/products/${productId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend responded with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    return NextResponse.json({ message: "Product status updated successfully" })
  } catch (error) {
    console.error("Error updating product status:", error)
    return NextResponse.json({ message: "Failed to update product status" }, { status: 500 })
  }
}
