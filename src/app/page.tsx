"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Calendar, User, Settings, LogOut, Bell, Wifi, WifiOff, Shield } from "lucide-react"
import { authService, type User as UserType } from "@/lib/auth"

// TypeScript interfaces
interface GoldRate {
  date: string
  gold22k: number
  gold24k: number
  timestamp: string
}

interface TodayRate extends GoldRate {
  change22k: number
  change24k: number
  changePercent22k: number
  changePercent24k: number
}

interface HistoryRate {
  date: string
  gold22k: number
  gold24k: number
}

interface PredictionRate {
  date: string
  predicted22k: number
  predicted24k: number
  confidence: number
  trend: "up" | "down" | "stable"
}

export default function GoldRatesPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [todayRate, setTodayRate] = useState<TodayRate | null>(null)
  const [yesterdayRate, setYesterdayRate] = useState<GoldRate | null>(null)
  const [historyRates, setHistoryRates] = useState<HistoryRate[]>([])
  const [prediction, setPrediction] = useState<PredictionRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const router = useRouter()

  // Check authentication status
  useEffect(() => {
    const currentUser = authService.getUser()
    setUser(currentUser)
  }, [])

  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      const response = await fetch("/api/health")
      const healthData = await response.json()
      setBackendConnected(healthData.backend === "connected")
      console.log("Backend health check:", healthData)
    } catch (err) {
      setBackendConnected(false)
      console.error("Backend health check failed:", err)
    }
  }

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check backend connection first
        await checkBackendConnection()

        // Fetch today's rates
        console.log("Fetching today rates...")
        const todayResponse = await fetch("/api/rate/today")
        if (!todayResponse.ok) throw new Error("Failed to fetch today's rates")
        const todayData = await todayResponse.json()
        console.log("Today data received:", todayData)
        setTodayRate(todayData)

        // Extract yesterday's rate from today's data
        if (todayData.yesterday) {
          setYesterdayRate(todayData.yesterday)
        }

        // Fetch historical rates
        console.log("Fetching history rates...")
        const historyResponse = await fetch("/api/rate/history?days=10")
        if (!historyResponse.ok) throw new Error("Failed to fetch historical rates")
        const historyData = await historyResponse.json()
        console.log("History data received:", historyData)
        setHistoryRates(historyData.rates || [])

        // Fetch prediction
        console.log("Fetching prediction...")
        const predictionResponse = await fetch("/api/rate/predict")
        if (!predictionResponse.ok) throw new Error("Failed to fetch prediction")
        const predictionData = await predictionResponse.json()
        console.log("Prediction data received:", predictionData)
        setPrediction(predictionData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSignOut = () => {
    authService.logout()
    setUser(null)
    router.push("/auth/signin")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gold rates...</p>
            <p className="text-sm text-gray-500 mt-2">Connecting to backend...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-yellow-600">KnowAllRates</h1>

              {/* Backend Connection Status */}
              <div className="flex items-center space-x-2">
                {backendConnected === true ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : backendConnected === false ? (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-500"></div>
                    <span className="text-xs">Checking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                        <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {user.role === "ADMIN" && (
                          <Badge className="w-fit bg-red-100 text-red-800 text-xs">Admin</Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem onClick={() => router.push("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => router.push("/auth/signin")}>
                    Sign In
                  </Button>
                  <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => router.push("/auth/signup")}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Backend Connection Issue</p>
                <p className="text-yellow-700 text-sm">Using fallback data. Error: {error}</p>
              </div>
            </div>
          </div>
        )}

        {backendConnected === true && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <p className="text-green-800">✅ Connected to backend database - showing live data</p>
            </div>
          </div>
        )}

        {/* Welcome Message for Authenticated Users */}
        {user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">Welcome back, {user.fullName}!</p>
                <p className="text-blue-600 text-sm">Track live gold rates and market predictions</p>
              </div>
              {user.role === "ADMIN" && (
                <Button onClick={() => router.push("/admin")} className="bg-red-600 hover:bg-red-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Today's Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-yellow-100">22K Gold Today</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {todayRate ? formatCurrency(todayRate.gold22k) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayRate && (
                <div className="flex items-center space-x-2">
                  {todayRate.change22k >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-200" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-200" />
                  )}
                  <span className={`text-sm ${todayRate.change22k >= 0 ? "text-green-200" : "text-red-200"}`}>
                    {todayRate.change22k >= 0 ? "+" : ""}
                    {todayRate.change22k?.toFixed(2)} ({todayRate.changePercent22k?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-orange-100">24K Gold Today</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {todayRate ? formatCurrency(todayRate.gold24k) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayRate && (
                <div className="flex items-center space-x-2">
                  {todayRate.change24k >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-200" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-200" />
                  )}
                  <span className={`text-sm ${todayRate.change24k >= 0 ? "text-green-200" : "text-red-200"}`}>
                    {todayRate.change24k >= 0 ? "+" : ""}
                    {todayRate.change24k?.toFixed(2)} ({todayRate.changePercent24k?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>22K Gold Yesterday</CardDescription>
              <CardTitle className="text-2xl">
                {yesterdayRate ? formatCurrency(yesterdayRate.gold22k) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{yesterdayRate ? formatDate(yesterdayRate.date) : "---"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>24K Gold Yesterday</CardDescription>
              <CardTitle className="text-2xl">
                {yesterdayRate ? formatCurrency(yesterdayRate.gold24k) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{yesterdayRate ? formatDate(yesterdayRate.date) : "---"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Historical Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Gold Rates - Last 10 Days</CardTitle>
              <CardDescription>Historical price trends for 22K and 24K gold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "gold22k" ? "22K Gold" : "24K Gold",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="gold22k"
                      stroke="#eab308"
                      strokeWidth={3}
                      dot={{ fill: "#eab308", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gold24k"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Tomorrow's Prediction</span>
              </CardTitle>
              <CardDescription>{prediction ? formatDate(prediction.date) : "---"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">22K Gold</span>
                      <span className="font-bold">{formatCurrency(prediction.predicted22k)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">24K Gold</span>
                      <span className="font-bold">{formatCurrency(prediction.predicted24k)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Confidence</span>
                      <Badge variant="secondary">{prediction.confidence}%</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Trend:</span>
                      {prediction.trend === "up" ? (
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Bullish
                        </Badge>
                      ) : prediction.trend === "down" ? (
                        <Badge className="bg-red-100 text-red-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Bearish
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Stable</Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rate Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Comparison - Last 5 Days</CardTitle>
            <CardDescription>Daily comparison between 22K and 24K gold prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyRates.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "gold22k" ? "22K Gold" : "24K Gold",
                    ]}
                  />
                  <Bar dataKey="gold22k" fill="#eab308" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gold24k" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
