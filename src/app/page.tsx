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
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Settings,
  LogOut,
  Bell,
  Wifi,
  WifiOff,
  Shield,
  CreditCard,
  Coins,
  DollarSign,
  ShoppingCart,
} from "lucide-react"
import { authService, type User as UserType } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"

// Enhanced interfaces for multiple assets
interface AssetRate {
  date: string
  gold22k: number
  gold24k: number
  silver: number
  bitcoin: number
  timestamp: string
}

interface TodayRate extends AssetRate {
  change22k: number
  change24k: number
  changePercent22k: number
  changePercent24k: number
  silverChange: number
  silverChangePercent: number
  bitcoinChange: number
  bitcoinChangePercent: number
}

interface HistoryRate {
  date: string
  gold22k: number
  gold24k: number
  silver: number
  bitcoin: number
}

interface PredictionRate {
  date: string
  predicted22k: number
  predicted24k: number
  predictedSilver: number
  predictedBitcoin: number
  confidence: number
  trend: "up" | "down" | "stable"
}

export default function GoldRatesPage() {
  const { formatCurrency, formatDate, t } = useSettings()
  const [user, setUser] = useState<UserType | null>(null)
  const [todayRate, setTodayRate] = useState<TodayRate | null>(null)
  const [yesterdayRate, setYesterdayRate] = useState<AssetRate | null>(null)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">{t("common.loading")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Fetching live data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">KnowAllRates</h1>

              {/* Backend Connection Status */}
              <div className="flex items-center space-x-2">
                {backendConnected === true ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs">{t("dashboard.live_data")}</span>
                  </div>
                ) : backendConnected === false ? (
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-500"></div>
                    <span className="text-xs">Checking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center space-x-4">
              {/* Shop Link */}
              <Button
                variant="ghost"
                onClick={() => router.push("/shop")}
                className="dark:text-gray-300 dark:hover:text-white flex items-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Shop Assets</span>
              </Button>
              <Button variant="ghost" size="icon" className="dark:text-gray-300 dark:hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                        <AvatarFallback className="dark:bg-gray-600 dark:text-white">
                          {user.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 dark:bg-gray-800 dark:border-gray-700" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none dark:text-white">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">{user.email}</p>
                        {user.role === "ADMIN" && (
                          <Badge className="w-fit bg-red-100 text-red-800 text-xs">Admin</Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("nav.profile")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("nav.settings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/payment")}
                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>{t("nav.payment")}</span>
                    </DropdownMenuItem>
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/admin")}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        <span>{t("nav.admin")}</span>
                      </DropdownMenuItem>
                    )}
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/products")}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        <span>{t("nav.admin.products")}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem onClick={handleSignOut} className="dark:text-gray-300 dark:hover:bg-gray-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("nav.signout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => router.push("/auth/signin")} className="dark:text-gray-300">
                    {t("nav.signin")}
                  </Button>
                  <Button
                    className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                    onClick={() => router.push("/auth/signup")}
                  >
                    {t("nav.signup")}
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
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-300 font-medium">{t("dashboard.connection_issue")}</p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  {t("dashboard.using_fallback")} {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {backendConnected === true && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-300">✅ {t("dashboard.live_data")}</p>
            </div>
          </div>
        )}

        {/* Welcome Message for Authenticated Users */}
        {user && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  {t("dashboard.welcome")}, {user.fullName}!
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">{t("dashboard.track")}</p>
              </div>
              {user.role === "ADMIN" && (
                <Button
                  onClick={() => router.push("/admin")}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t("nav.admin")}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Today's Rates - Enhanced with multiple assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {/* Gold 22K */}
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-yellow-100 flex items-center">
                <Coins className="h-4 w-4 mr-1" />
                {t("asset.gold_22k")}
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
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
                    {formatCurrency(todayRate.change22k)} ({todayRate.changePercent22k?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gold 24K */}
          <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-orange-100 flex items-center">
                <Coins className="h-4 w-4 mr-1" />
                {t("asset.gold_24k")}
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
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
                    {formatCurrency(todayRate.change24k)} ({todayRate.changePercent24k?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Silver */}
          <Card className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-100 flex items-center">
                <Coins className="h-4 w-4 mr-1" />
                {t("asset.silver")}
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {todayRate ? formatCurrency(todayRate.silver) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayRate && (
                <div className="flex items-center space-x-2">
                  {todayRate.silverChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-200" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-200" />
                  )}
                  <span className={`text-sm ${todayRate.silverChange >= 0 ? "text-green-200" : "text-red-200"}`}>
                    {todayRate.silverChange >= 0 ? "+" : ""}
                    {formatCurrency(todayRate.silverChange)} ({todayRate.silverChangePercent?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bitcoin */}
          <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-orange-100 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {t("asset.bitcoin")}
              </CardDescription>
              <CardTitle className="text-xl font-bold">
                {todayRate ? formatCurrency(todayRate.bitcoin) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayRate && (
                <div className="flex items-center space-x-2">
                  {todayRate.bitcoinChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-200" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-200" />
                  )}
                  <span className={`text-sm ${todayRate.bitcoinChange >= 0 ? "text-green-200" : "text-red-200"}`}>
                    {todayRate.bitcoinChange >= 0 ? "+" : ""}
                    {formatCurrency(todayRate.bitcoinChange)} ({todayRate.bitcoinChangePercent?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Yesterday Gold 22K */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="dark:text-gray-400">{t("asset.gold_22k_yesterday")}</CardDescription>
              <CardTitle className="text-xl dark:text-white">
                {yesterdayRate ? formatCurrency(yesterdayRate.gold22k) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {yesterdayRate ? formatDate(yesterdayRate.date) : "---"}
              </p>
            </CardContent>
          </Card>

          {/* Yesterday Gold 24K */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="dark:text-gray-400">{t("asset.gold_24k_yesterday")}</CardDescription>
              <CardTitle className="text-xl dark:text-white">
                {yesterdayRate ? formatCurrency(yesterdayRate.gold24k) : "---"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {yesterdayRate ? formatDate(yesterdayRate.date) : "---"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Historical Chart */}
          <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">{t("chart.historical")}</CardTitle>
              <CardDescription className="dark:text-gray-400">{t("chart.historical_desc")}</CardDescription>
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
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "gold22k"
                          ? t("asset.gold_22k")
                          : name === "gold24k"
                            ? t("asset.gold_24k")
                            : name === "silver"
                              ? t("asset.silver")
                              : t("asset.bitcoin"),
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="gold22k"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ fill: "#eab308", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gold24k"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="silver"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={{ fill: "#6b7280", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Prediction Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Calendar className="h-5 w-5" />
                <span>{t("prediction.title")}</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {prediction ? formatDate(prediction.date) : "---"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium dark:text-gray-300">22K Gold</span>
                      <span className="font-bold dark:text-white">{formatCurrency(prediction.predicted22k)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium dark:text-gray-300">24K Gold</span>
                      <span className="font-bold dark:text-white">{formatCurrency(prediction.predicted24k)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium dark:text-gray-300">Silver</span>
                      <span className="font-bold dark:text-white">{formatCurrency(prediction.predictedSilver)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium dark:text-gray-300">Bitcoin</span>
                      <span className="font-bold dark:text-white">{formatCurrency(prediction.predictedBitcoin)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium dark:text-gray-300">{t("prediction.confidence")}</span>
                      <Badge variant="secondary">{prediction.confidence}%</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium dark:text-gray-300">{t("prediction.trend")}:</span>
                      {prediction.trend === "up" ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {t("prediction.bullish")}
                        </Badge>
                      ) : prediction.trend === "down" ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {t("prediction.bearish")}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {t("prediction.stable")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rate Comparison Bar Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t("chart.comparison")}</CardTitle>
            <CardDescription className="dark:text-gray-400">{t("chart.comparison_desc")}</CardDescription>
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
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "gold22k"
                        ? t("asset.gold_22k")
                        : name === "gold24k"
                          ? t("asset.gold_24k")
                          : name === "silver"
                            ? t("asset.silver")
                            : t("asset.bitcoin"),
                    ]}
                  />
                  <Bar dataKey="gold22k" fill="#eab308" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gold24k" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="silver" fill="#6b7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
