"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth"
import { Settings, Save, ArrowLeft, TrendingUp, AlertCircle } from "lucide-react"

interface Asset {
  id: number
  name: string
  displayName: string
  isActive: boolean
}

export default function AdminPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState("")
  const [formData, setFormData] = useState({
    rate22k: "",
    rate24k: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    console.log("Admin page - checking authentication")
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

    if (!authService.isAuthenticated()) {
      console.log("Admin page - not authenticated, redirecting to signin")
      router.push("/auth/signin")
      return
    }

    if (!authService.isAdmin()) {
      console.log("Admin page - not admin, redirecting to home")
      router.push("/")
      return
    }

    console.log("Admin page - authentication passed, fetching assets")
    fetchAssets()
  }, [router])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      setError("")

      const authHeaders = authService.getAuthHeaders()
      console.log("Fetching assets with headers:", authHeaders)
      console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
      console.log("process.env.GOLD_API_BASE_URL:", process.env.GOLD_API_BASE_URL)

      const response = await fetch("/api/admin/assets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      })

      console.log("Assets response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Assets fetch error:", errorText)
        throw new Error(`Failed to fetch assets: ${response.status} - ${errorText}`)
      }

      const assetsData = await response.json()
      console.log("Assets data received:", assetsData)
      setAssets(assetsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load assets"
      console.error("Assets fetch error:", err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsset) {
      setError("Please select an asset")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const authHeaders = authService.getAuthHeaders()
      console.log("Updating rates with headers:", authHeaders)

      const requestBody = {
        assetName: selectedAsset,
        rate22k: Number.parseFloat(formData.rate22k),
        rate24k: Number.parseFloat(formData.rate24k),
        date: formData.date,
      }

      console.log("Update request body:", requestBody)

      const response = await fetch("/api/admin/rates/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Update response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Update error:", errorText)
        throw new Error(`Failed to update rates: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("Update successful:", result)

      setSuccess("Rates updated successfully!")
      setFormData({
        rate22k: "",
        rate24k: "",
        date: new Date().toISOString().split("T")[0],
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Update failed"
      console.error("Update error:", err)
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
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

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Settings className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Admin Panel</CardTitle>
                <CardDescription>Update today's rates for various assets</CardDescription>
              </div>
            </div>
            <Badge className="w-fit bg-red-100 text-red-800">Admin Access</Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Select Asset</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an asset to update" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.name}>
                          {asset.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                </div>
              </div>

              {selectedAsset === "gold" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="rate22k">22K Gold Rate (₹)</Label>
                    <Input
                      id="rate22k"
                      name="rate22k"
                      type="number"
                      step="0.01"
                      value={formData.rate22k}
                      onChange={handleChange}
                      required
                      placeholder="Enter 22K gold rate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate24k">24K Gold Rate (₹)</Label>
                    <Input
                      id="rate24k"
                      name="rate24k"
                      type="number"
                      step="0.01"
                      value={formData.rate24k}
                      onChange={handleChange}
                      required
                      placeholder="Enter 24K gold rate"
                    />
                  </div>
                </div>
              )}

              {selectedAsset && selectedAsset !== "gold" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Rate management for {assets.find((a) => a.name === selectedAsset)?.displayName} will be available in
                    future updates.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                disabled={saving || !selectedAsset || selectedAsset !== "gold"}
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating rates...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Update Rates</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Available Assets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{asset.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
