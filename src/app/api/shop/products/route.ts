import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    }

    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    const response = await fetch(`${backendUrl}/api/shop/products`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching products:", error)

    // Return mock data as fallback
    const mockProducts = [
      {
        id: 1,
        name: "22K Gold Necklace",
        description: "Beautiful traditional gold necklace with intricate design",
        price: 125000,
        discountPrice: 118750,
        discountPercentage: 5,
        imageUrl: "/placeholder.svg?height=300&width=300",
        category: "gold",
        inStock: true,
        stockQuantity: 5,
        rating: 4.8,
        reviewCount: 24,
        weight: "25g",
        purity: "22K",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Silver Bracelet Set",
        description: "Elegant silver bracelet set for special occasions",
        price: 8500,
        discountPrice: 7650,
        discountPercentage: 10,
        imageUrl: "/placeholder.svg?height=300&width=300",
        category: "silver",
        inStock: true,
        stockQuantity: 12,
        rating: 4.6,
        reviewCount: 18,
        weight: "45g",
        purity: "925 Sterling",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json(mockProducts, {
      headers: {
        "X-Data-Source": "mock-fallback",
      },
    })
  }
}
