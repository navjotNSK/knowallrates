"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { authService, type User } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Tag,
  Truck,
  CheckCircle,
  Package,
} from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  discountPrice?: number
  imageUrl: string
  weight?: string
  purity?: string
}

interface CartItem {
  id: number
  totalAmount: number
  totalItems: number
  product: Product
}

interface Address {
  id?: number
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function CartPage() {
  const { formatCurrency, t } = useSettings()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<"cart" | "address" | "payment" | "success">("cart")
  const [orderId, setOrderId] = useState("")
  const router = useRouter()

  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }

    const currentUser = authService.getUser()
    setUser(currentUser)
    fetchCart()
    fetchAddresses()
  }, [router])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/shop/cart", {
        headers: authService.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        const mappedItems: CartItem[] = (data.items || []).map((item: any) => ({
          id: item.id,
          totalAmount: item.totalPrice,
          totalItems: item.quantity,
          product: {
            id: item.productId,
            name: item.name,
            price: item.totalPrice,
            discountPrice: item.discountPrice,
            imageUrl: item.imageUrl,
            weight: item.weight?.toString() + "g",
            purity: item.purity,
          },
        }))
        setCartItems(mappedItems)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      // Mock data for demo
      setCartItems([
        {
          id: 1,
          totalAmount: 1,
          totalItems: 2,
          product: {
            id: 1,
            name: "22K Gold Necklace",
            price: 125000,
            discountPrice: 118750,
            imageUrl: "/placeholder.svg?height=100&width=100",
            weight: "25g",
            purity: "22K",
          },
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/shop/addresses", {
        headers: authService.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        const defaultAddr = data.find((addr: Address) => addr.isDefault)
        if (defaultAddr) setSelectedAddress(defaultAddr)
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
    }
  }

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await fetch("/api/shop/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })
      fetchCart()
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      await fetch(`/api/shop/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: authService.getAuthHeaders(),
      })
      fetchCart()
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  const applyCoupon = async () => {
    try {
      const response = await fetch("/api/shop/coupon/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({ code: couponCode }),
      })
      if (response.ok) {
        const data = await response.json()
        setCouponDiscount(data.discount)
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error)
    }
  }

  const saveAddress = async () => {
    try {
      const response = await fetch("/api/shop/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(newAddress),
      })
      if (response.ok) {
        fetchAddresses()
        setShowAddressForm(false)
        setNewAddress({
          fullName: "",
          phoneNumber: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        })
      }
    } catch (error) {
      console.error("Failed to save address:", error)
    }
  }

  const placeOrder = async () => {
    try {
      const response = await fetch("/api/shop/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          shippingAddress: selectedAddress
            ? `${selectedAddress.fullName}\n${selectedAddress.addressLine1}\n${selectedAddress.addressLine2 ? selectedAddress.addressLine2 + "\n" : ""}${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}\nPhone: ${selectedAddress.phoneNumber}`
            : "",
          couponCode: couponCode || null,
          paymentMethod: "UPI",
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setOrderId(data.orderId)
        setStep("success")
      }
    } catch (error) {
      console.error("Failed to place order:", error)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price
    return sum + price * item.totalItems
  }, 0)

  const shipping = subtotal > 50000 ? 0 : 500
  const total = subtotal + shipping - couponDiscount

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">Order Placed!</CardTitle>
            <CardDescription className="dark:text-gray-300">Your order has been successfully placed</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
              <p className="font-mono font-bold text-lg dark:text-white">{orderId}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You will receive an email confirmation shortly with tracking details.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/shop/orders")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                View My Orders
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/shop")}
                className="w-full dark:border-gray-600 dark:text-gray-300"
              >
                Continue Shopping
              </Button>
            </div>
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
              <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {step === "cart" ? "Shopping Cart" : step === "address" ? "Delivery Address" : "Payment"}
              </h1>
            </div>
            <Button
              onClick={() => router.push("/shop/orders")}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <Package className="h-4 w-4 mr-2" />
              My Orders
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {["cart", "address", "payment"].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName
                      ? "bg-yellow-600 text-white"
                      : index < ["cart", "address", "payment"].indexOf(step)
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium capitalize dark:text-gray-300">{stepName}</span>
                {index < 2 && <div className="w-16 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "cart" && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
                      <Button onClick={() => router.push("/shop")} className="mt-4 bg-yellow-600 hover:bg-yellow-700">
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg dark:border-gray-600"
                        >
                          <img
                            src={item.product.imageUrl || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium dark:text-white">{item.product.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.product.weight} • {item.product.purity}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {item.product.discountPrice ? (
                                <>
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(item.product.discountPrice)}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatCurrency(item.product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold dark:text-white">{formatCurrency(item.product.price)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.totalItems - 1)}
                              disabled={item.totalItems <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center dark:text-white">{item.totalItems}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.totalItems + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === "address" && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? "border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium dark:text-white">{address.fullName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{address.phoneNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {!showAddressForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(true)}
                      className="w-full dark:border-gray-600 dark:text-gray-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  ) : (
                    <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
                      <h3 className="font-medium dark:text-white">Add New Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={newAddress.phoneNumber}
                            onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="addressLine1">Address Line 1</Label>
                        <Input
                          id="addressLine1"
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                        <Input
                          id="addressLine2"
                          value={newAddress.addressLine2}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        <Label htmlFor="isDefault" className="text-sm">
                          Set as default address
                        </Label>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={saveAddress} className="bg-yellow-600 hover:bg-yellow-700">
                          Save Address
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <input type="radio" id="upi" name="payment" defaultChecked />
                        <Label htmlFor="upi" className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5" />
                          <span>UPI Payment</span>
                        </Label>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg dark:border-gray-600 opacity-50">
                      <div className="flex items-center space-x-3">
                        <input type="radio" id="card" name="payment" disabled />
                        <Label htmlFor="card" className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5" />
                          <span>Credit/Debit Card (Coming Soon)</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-gray-300">Subtotal</span>
                    <span className="dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-gray-300">Shipping</span>
                    <span className="dark:text-white">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <hr className="dark:border-gray-600" />
                  <div className="flex justify-between font-bold">
                    <span className="dark:text-white">Total</span>
                    <span className="dark:text-white">{formatCurrency(total)}</span>
                  </div>
                </div>

                {step === "cart" && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Button onClick={applyCoupon} variant="outline" size="sm">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => setStep("address")}
                      disabled={cartItems.length === 0}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                    >
                      Proceed to Address
                    </Button>
                  </div>
                )}

                {step === "address" && (
                  <Button
                    onClick={() => setStep("payment")}
                    disabled={!selectedAddress}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                  >
                    Proceed to Payment
                  </Button>
                )}

                {step === "payment" && (
                  <Button
                    onClick={placeOrder}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                  >
                    Place Order
                  </Button>
                )}

                {shipping === 0 && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping applied!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
