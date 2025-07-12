"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authService } from "@/lib/auth"
import { CreditCard, ArrowLeft, QrCode, Smartphone, CheckCircle, Copy } from "lucide-react"

export default function PaymentPage() {
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const predefinedAmounts = ["100", "250", "500", "1000", "2500", "5000"]
  const upiId = "knowallrates@paytm" // Replace with your actual UPI ID
  const phoneNumber = "+91-9876543210" // Replace with your actual phone number

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }
  }, [router])

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const getPaymentAmount = () => {
    return customAmount || selectedAmount
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateUPILink = () => {
    const amount = getPaymentAmount()
    if (!amount) return ""

    return `upi://pay?pa=${upiId}&pn=KnowAllRates&am=${amount}&cu=INR&tn=Payment for KnowAllRates Premium`
  }

  const handleUPIPayment = () => {
    const upiLink = generateUPILink()
    if (upiLink) {
      window.open(upiLink, "_blank")
    }
  }

  const handleRazorpayPayment = async () => {
    const amount = getPaymentAmount()
    if (!amount) {
      setError("Please select or enter an amount")
      return
    }

    setLoading(true)
    setError("")

    try {
      // In a real implementation, you would:
      // 1. Create an order on your backend
      // 2. Initialize Razorpay with the order details
      // 3. Handle the payment success/failure

      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        setSuccess(true)
        setLoading(false)
      }, 2000)
    } catch (err) {
      setError("Payment failed. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
            <CardDescription>Thank you for supporting KnowAllRates</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg font-semibold">₹{getPaymentAmount()}</p>
            <p className="text-sm text-gray-600">
              Your payment has been processed successfully. You now have access to premium features.
            </p>
            <Button onClick={() => router.push("/")} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Support KnowAllRates</CardTitle>
                  <CardDescription>Help us maintain and improve our services</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              {/* Amount Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Select Amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="h-12"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customAmount">Or enter custom amount</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Enter amount in ₹"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount("")
                    }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upi">UPI Payment</TabsTrigger>
                  <TabsTrigger value="card">Card Payment</TabsTrigger>
                </TabsList>

                <TabsContent value="upi" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <QrCode className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Scan QR Code or Use UPI ID</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">UPI ID:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{upiId}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(upiId)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Phone:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{phoneNumber}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(phoneNumber)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {copied && <p className="text-sm text-green-600">Copied to clipboard!</p>}

                    <Button
                      onClick={handleUPIPayment}
                      disabled={!getPaymentAmount()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Pay ₹{getPaymentAmount() || "0"} via UPI
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="card" className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Secure Card Payment</p>
                      <p className="text-xs text-gray-600">Powered by Razorpay</p>
                    </div>

                    <Button
                      onClick={handleRazorpayPayment}
                      disabled={!getPaymentAmount() || loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Pay ₹{getPaymentAmount() || "0"} via Card</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* QR Code and Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Scan the QR code below for quick payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">GPay QR Code</p>
                    <p className="text-xs text-gray-400">Scan with any UPI app</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <h3 className="font-medium">Why Support Us?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time gold, silver, and crypto rates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Advanced prediction algorithms</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Historical data and analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ad-free experience</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority customer support</span>
                  </li>
                </ul>
              </div>

              {/* Security Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Secure Payment:</strong> All payments are processed securely. We don't store your payment
                  information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
