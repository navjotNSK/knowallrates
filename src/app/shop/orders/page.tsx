"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"
import { Package, Calendar, DollarSign, MapPin, Loader2, ArrowLeft } from "lucide-react"

interface OrderItem {
  id: number
  productId: number
  productName: string
  productImageUrl: string
  productWeight: string
  productPurity: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: number
  orderId: string
  userEmail: string
  userFullName: string
  subtotalAmount: number
  totalAmount: number
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  shippingAddress: string
  status: string
  paymentStatus: string
  paymentMethod: string
  couponCode: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { formatCurrency } = useSettings()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/shop/orders", {
        headers: authService.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : data.content || [])
      } else {
        setError("Failed to fetch orders.")
      }
    } catch (err) {
      setError("An error occurred while fetching orders.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary"
      case "confirmed":
      case "processing":
        return "default"
      case "shipped":
        return "outline"
      case "delivered":
        return "default" // Green-ish default
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary"
      case "paid":
        return "default"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
          <CardContent className="mt-4 text-red-800 dark:text-red-200">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
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
              <Button variant="ghost" onClick={() => router.push("/shop")} className="dark:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
              <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">My Orders</h1>
            </div>
            <Button
              onClick={() => router.push("/shop/cart")}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              View Cart
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't placed any orders yet.</p>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card key={order.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl font-semibold dark:text-white">Order #{order.orderId}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
                      {order.status}
                    </Badge>
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="text-sm">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Total Amount: {formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex items-start space-x-2 col-span-1 md:col-span-2">
                      <MapPin className="h-4 w-4 mt-1" />
                      <span>Delivery Address: {order.shippingAddress}</span>
                    </div>
                  </div>

                  <div className="border-t dark:border-gray-700 pt-4 mt-4">
                    <h3 className="text-lg font-semibold dark:text-white mb-3">Items:</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <img
                            src={item.productImageUrl || "/placeholder.svg?height=64&width=64"}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p className="font-medium dark:text-white">{item.productName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.productWeight} • {item.productPurity}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.quantity} x {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <span className="font-semibold dark:text-white">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t dark:border-gray-700 pt-4 mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="dark:text-gray-300">Subtotal:</span>
                        <span className="dark:text-white">{formatCurrency(order.subtotalAmount)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="dark:text-gray-300">Tax (18% GST):</span>
                        <span className="dark:text-white">{formatCurrency(order.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="dark:text-gray-300">Shipping:</span>
                        <span className="dark:text-white">
                          {order.shippingAmount > 0 ? formatCurrency(order.shippingAmount) : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base border-t dark:border-gray-600 pt-2">
                        <span className="dark:text-white">Total:</span>
                        <span className="dark:text-white">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
