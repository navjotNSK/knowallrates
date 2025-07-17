"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Eye, Download, RefreshCw } from "lucide-react"

interface OrderItem {
  id: number
  productId: number
  quantity: number
  price: number
  product: {
    name: string
    imageUrl: string
    weight?: string
    purity?: string
  }
}

interface Order {
  id: number
  orderId: string
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  totalAmount: number
  createdAt: string
  deliveryAddress: string
  paymentMethod: string
  items: OrderItem[]
  trackingNumber?: string
  estimatedDelivery?: string
}

export default function OrdersPage() {
  const { formatCurrency, formatDate, t } = useSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        headers: authService.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      // Mock data for demo
      setOrders([
        {
          id: 1,
          orderId: "KAR-2024-001",
          status: "SHIPPED",
          totalAmount: 237500,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: "123 Main St, Mumbai, Maharashtra - 400001",
          paymentMethod: "UPI",
          trackingNumber: "TRK123456789",
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: 1,
              productId: 1,
              quantity: 2,
              price: 118750,
              product: {
                name: "22K Gold Necklace",
                imageUrl: "/placeholder.svg?height=80&width=80",
                weight: "25g",
                purity: "22K",
              },
            },
          ],
        },
        {
          id: 2,
          orderId: "KAR-2024-002",
          status: "DELIVERED",
          totalAmount: 65000,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: "123 Main St, Mumbai, Maharashtra - 400001",
          paymentMethod: "UPI",
          items: [
            {
              id: 2,
              productId: 3,
              quantity: 1,
              price: 65000,
              product: {
                name: "24K Gold Coins (10g)",
                imageUrl: "/placeholder.svg?height=80&width=80",
                weight: "10g",
                purity: "24K",
              },
            },
          ],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />
      case "SHIPPED":
        return <Truck className="h-4 w-4" />
      case "DELIVERED":
        return <Package className="h-4 w-4" />
      case "CANCELLED":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
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
              <Button variant="ghost" onClick={() => router.push("/shop")} className="dark:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
              <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">My Orders</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg dark:text-white">Order #{order.orderId}</CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Placed on {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                      <span className="font-bold text-lg dark:text-white">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <img
                            src={item.product.imageUrl || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium dark:text-white">{item.product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Qty: {item.quantity} • {item.product.weight} • {item.product.purity}
                            </p>
                          </div>
                          <span className="font-medium dark:text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-600">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Address</p>
                        <p className="text-sm dark:text-gray-300">{order.deliveryAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</p>
                        <p className="text-sm dark:text-gray-300">{order.paymentMethod}</p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking Number</p>
                          <p className="text-sm font-mono dark:text-gray-300">{order.trackingNumber}</p>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Delivery</p>
                          <p className="text-sm dark:text-gray-300">{formatDate(order.estimatedDelivery)}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 pt-4 border-t dark:border-gray-600">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {order.status === "SHIPPED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                      {order.status === "DELIVERED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      )}
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
