"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { authService } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"
import { ShoppingCart, Star, Search, ArrowLeft, Heart, Eye, Truck, Shield, RotateCcw } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  imageUrl: string
  category: string
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  weight?: string
  purity?: string
  active: boolean
  createdAt: string
}

interface CartItem {
  productId: number
  quantity: number
  product: Product
}


 // Helper function to construct image URLs
const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg"
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    const baseUrl = "/api/uploads/products"
    // Ensure baseUrl is not undefined or empty before prepending
    // If baseUrl is not set, it will default to an empty string, making the path relative to the current origin.
    return `${baseUrl || ""}${path}`
}

export default function ShopPage() {
  const { formatCurrency, t } = useSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }
    fetchProducts()
    fetchCart()
  }, [router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/shop/products", {
        headers: authService.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        console.log(data)
        
        const safeProducts = data.map((item: any): Product => ({
        id: item.id ?? 0,
        name: item.name ?? "Unnamed Product",
        description: item.description ?? "",
        price: item.price ?? 0,
        discountPrice: item.discountPrice ?? undefined,
        discountPercentage: item.discountPercentage ?? undefined,
        imageUrl: item.imageUrl ?? "/placeholder.svg",
        category: item.category ?? "misc",
        inStock: item.inStock ?? true,
        stockQuantity: item.stockQuantity ?? 0,
        rating: item.rating ?? 0,
        reviewCount: item.reviewCount ?? 0,
        weight: item.weight ?? "",
        purity: item.purity ?? "",
        active: item.active ?? true,
        createdAt: item.createdAt ?? new Date().toISOString(),
      }))

      setProducts(safeProducts)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      // Mock data for demo
      setProducts([
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
          active: true,
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
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: "24K Gold Coins (10g)",
          description: "Pure 24K gold coins for investment",
          price: 65000,
          imageUrl: "/placeholder.svg?height=300&width=300",
          category: "gold",
          inStock: true,
          stockQuantity: 20,
          rating: 5.0,
          reviewCount: 45,
          weight: "10g",
          purity: "24K",
          active: true,
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/shop/cart", {
        headers: authService.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setCart(data.items || [])
        setCartCount(data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  const addToCart = async (productId: number, quantity = 1) => {
    try {
      const response = await fetch("/api/shop/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({ productId, quantity }),
      })

      if (response.ok) {
        fetchCart() // Refresh cart
        // Show success message
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory && product.active && product.inStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price)
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price)
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const categories = ["all", "gold", "silver", "platinum", "diamond"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="dark:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Shop Assets</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/shop/cart")}
                className="relative dark:border-gray-600 dark:text-gray-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={getImageUrl(product.imageUrl) || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discountPercentage && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg dark:text-white">{product.name}</CardTitle>
                    <CardDescription className="dark:text-gray-400">{product.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({product.reviewCount})</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {product.discountPrice ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(product.discountPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold dark:text-white">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.weight} • {product.purity}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Stock: {product.stockQuantity}</span>
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 dark:bg-gray-800 dark:border-gray-700">
            <Truck className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 dark:text-white">Free Shipping</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Free shipping on orders above ₹50,000</p>
          </Card>
          <Card className="text-center p-6 dark:bg-gray-800 dark:border-gray-700">
            <Shield className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 dark:text-white">Secure Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">100% secure payment with encryption</p>
          </Card>
          <Card className="text-center p-6 dark:bg-gray-800 dark:border-gray-700">
            <RotateCcw className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 dark:text-white">Easy Returns</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">7-day return policy for all products</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
