"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"
import { Plus, Edit, Trash2, ArrowLeft, Save, X, Eye, EyeOff, Package, Star } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  basePrice: number // Added basePrice to match backend DTO
  price: number // This is the final price from backend
  assetName?: string
  discountPercentage?: number
  imageUrl: string // Now a local path
  additionalImages?: string[] // Now local paths
  category: string
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  weight?: string // Changed to string to match frontend input/display
  purity?: string
  isActive: boolean
  createdAt: string
}

export default function AdminProductsPage() {
  const { formatCurrency, t } = useSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "", // Base price
    assetName: "",
    discountPercentage: "",
    mainImageFile: null as File | null, // For new main image upload
    mainImageUrlPreview: "" as string | null, // For previewing new main image
    existingImageUrl: "" as string | null, // For displaying existing main image
    additionalImageFiles: [] as File[], // For new additional image uploads
    additionalImagePreviews: [] as string[], // For previewing new additional images
    existingAdditionalImages: [] as string[], // For displaying existing additional images
    category: "gold",
    stockQuantity: "",
    weight: "", // String for input
    purity: "",
    isActive: true,
  })

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products", {
        headers: authService.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          basePrice: item.basePrice,
          price: item.price, // Final price
          assetName: item.assetName,
          discountPercentage: item.discountPercentage,
          imageUrl: item.imageUrl, // This is now a local path
          additionalImages: item.additionalImages || [], // These are now local paths
          category: item.category,
          inStock: item.stockQuantity > 0,
          stockQuantity: item.stockQuantity,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          weight: item.weightInGrams ? `${item.weightInGrams}g` : "", // Format for display
          purity: item.purity,
          isActive: item.isActive,
          createdAt: new Date().toISOString(),
        }))
        setProducts(mappedProducts)
      } else {
        throw new Error("Failed to fetch products from backend")
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      // Mock data for demo
      setProducts([
        {
          id: 1,
          name: "22K Gold Necklace",
          description: "Beautiful traditional gold necklace with intricate design",
          basePrice: 125000,
          price: 118750,
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
          basePrice: 8500,
          price: 7650,
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
      ])
    } finally {
      setLoading(false)
    }
  }, [authService])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }

    if (!authService.isAdmin()) {
      router.push("/")
      return
    }

    // Log the environment variable for debugging
    console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

    fetchProducts()
  }, [router, authService, fetchProducts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price), // Base price
        assetName: formData.assetName,
        discountPercentage: formData.discountPercentage ? Number.parseFloat(formData.discountPercentage) : 0,
        category: formData.category,
        stockQuantity: Number.parseInt(formData.stockQuantity),
        weight: formData.weight, // Send as string
        purity: formData.purity,
        isActive: formData.isActive,
        // When editing, send existing image URLs if no new file is uploaded
        imageUrl: formData.mainImageFile ? null : formData.existingImageUrl,
        additionalImages: formData.additionalImageFiles.length > 0 ? [] : formData.existingAdditionalImages,
      }

      const data = new FormData()
      data.append("product", JSON.stringify(productData)) // Append product data as JSON string

      if (formData.mainImageFile) {
        data.append("mainImage", formData.mainImageFile)
      }
      formData.additionalImageFiles.forEach((file) => {
        data.append("additionalImages", file)
      })

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          ...authService.getAuthHeaders(),
          // Do NOT set Content-Type for FormData, browser sets it automatically with boundary
        },
        body: data,
      })

      if (response.ok) {
        fetchProducts()
        resetForm()
      } else {
        const errorData = await response.json()
        console.error("Failed to save product:", errorData.message || response.statusText)
        alert(`Failed to save product: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to save product:", error)
      alert("An unexpected error occurred while saving product.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.basePrice.toString(), // Use basePrice for editing
      assetName: product.assetName || "",
      discountPercentage: product.discountPercentage?.toString() || "",
      mainImageFile: null, // Clear file input for edit
      mainImageUrlPreview: null, // Clear preview for new upload
      existingImageUrl: product.imageUrl, // Set existing image URL
      additionalImageFiles: [], // Clear file input for edit
      additionalImagePreviews: [], // Clear preview for new upload
      existingAdditionalImages: product.additionalImages || [], // Set existing additional image URLs
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      weight: product.weight || "",
      purity: product.purity || "",
      isActive: product.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: authService.getAuthHeaders(),
      })

      if (response.ok) {
        fetchProducts()
      } else {
        const errorData = await response.json()
        console.error("Failed to delete product:", errorData.message || response.statusText)
        alert(`Failed to delete product: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert("An unexpected error occurred while deleting product.")
    }
  }

  const toggleProductStatus = async (productId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchProducts()
      } else {
        const errorData = await response.json()
        console.error("Failed to update product status:", errorData.message || response.statusText)
        alert(`Failed to update product status: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to update product status:", error)
      alert("An unexpected error occurred while updating product status.")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      assetName: "",
      discountPercentage: "",
      mainImageFile: null,
      mainImageUrlPreview: null,
      existingImageUrl: null,
      additionalImageFiles: [],
      additionalImagePreviews: [],
      existingAdditionalImages: [],
      category: "gold",
      stockQuantity: "",
      weight: "",
      purity: "",
      isActive: true,
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, mainImageFile: file, mainImageUrlPreview: URL.createObjectURL(file) }))
    } else {
      setFormData((prev) => ({ ...prev, mainImageFile: null, mainImageUrlPreview: null }))
    }
  }

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const previews = files.map((file) => URL.createObjectURL(file))
      setFormData((prev) => ({
        ...prev,
        additionalImageFiles: files,
        additionalImagePreviews: previews,
      }))
    } else {
      setFormData((prev) => ({ ...prev, additionalImageFiles: [], additionalImagePreviews: [] }))
    }
  }

  const removeExistingAdditionalImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      existingAdditionalImages: prev.existingAdditionalImages.filter((_, index) => index !== indexToRemove),
    }))
  }

  const removeNewAdditionalImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImageFiles: prev.additionalImageFiles.filter((_, index) => index !== indexToRemove),
      additionalImagePreviews: prev.additionalImagePreviews.filter((_, index) => index !== indexToRemove),
    }))
  }
  
  // Helper function to construct image URLs
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg"
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL + "/api/uploads/products"
    // Ensure baseUrl is not undefined or empty before prepending
    // If baseUrl is not set, it will default to an empty string, making the path relative to the current origin.
    return `${baseUrl || ""}${path}`
  }

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
              <Button variant="ghost" onClick={() => router.push("/admin")} className="dark:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Manage Products</h1>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                        <option value="diamond">Diamond</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetName">Asset Name</Label>
                      <Input
                        id="assetName"
                        name="assetName"
                        value={formData.assetName}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount %</Label>
                      <Input
                        id="discountPercentage"
                        name="discountPercentage"
                        type="number"
                        step="0.01"
                        value={formData.discountPercentage}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                      <Input
                        id="stockQuantity"
                        name="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="e.g., 25g"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purity">Purity</Label>
                      <Input
                        id="purity"
                        name="purity"
                        value={formData.purity}
                        onChange={handleChange}
                        placeholder="e.g., 22K, 925 Sterling"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {/* Main Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="mainImage">Main Product Image</Label>
                    <Input
                      id="mainImage"
                      name="mainImage"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="dark:bg-gray-700 dark:border-gray-600 file:text-yellow-600 dark:file:text-yellow-400"
                    />
                    {(formData.mainImageUrlPreview || formData.existingImageUrl) && (
                      <div className="mt-2 flex items-center space-x-2">
                        <img
                          src={formData.mainImageUrlPreview || getImageUrl(formData.existingImageUrl)}
                          alt="Main Image Preview"
                          className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formData.mainImageFile?.name || "Existing Image"}
                        </span>
                      </div>
                    )}
                    {!editingProduct && !formData.mainImageFile && (
                      <p className="text-sm text-red-500">Main image is required for new products.</p>
                    )}
                  </div>

                  {/* Additional Images Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalImages">Additional Product Images</Label>
                    <Input
                      id="additionalImages"
                      name="additionalImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesUpload}
                      className="dark:bg-gray-700 dark:border-gray-600 file:text-yellow-600 dark:file:text-yellow-400"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.existingAdditionalImages.map((imgUrl, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={getImageUrl(imgUrl) || "/placeholder.svg"}
                            alt={`Additional Image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => removeExistingAdditionalImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {formData.additionalImagePreviews.map((previewUrl, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={getImageUrl(previewUrl) || "/placeholder.svg"}
                            alt={`New Additional Image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => removeNewAdditionalImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <Label htmlFor="isActive">Product is active</Label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving || (!editingProduct && !formData.mainImageFile)}
                      className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                    >
                      {saving ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>{editingProduct ? "Update Product" : "Add Product"}</span>
                        </div>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold dark:text-white">Products ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first product to start selling.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="relative">
                    <img
                      src={getImageUrl(product.imageUrl) || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">{product.discountPercentage}% OFF</Badge>
                      )}
                      <Badge
                        className={
                          product.isActive ? "bg-green-500 text-white text-xs" : "bg-gray-500 text-white text-xs"
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg dark:text-white">{product.name}</CardTitle>
                    <CardDescription className="dark:text-gray-400">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discountPercentage && product.discountPercentage > 0 ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.basePrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold dark:text-white">{formatCurrency(product.price)}</span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Stock: {product.stockQuantity}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>
                      </div>

                      {(product.weight || product.purity) && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {product.weight} {product.weight && product.purity ? "•" : ""} {product.purity}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="flex-1 dark:border-gray-600 dark:text-gray-300"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleProductStatus(product.id, !product.isActive)}
                          className="dark:border-gray-600 dark:text-gray-300"
                        >
                          {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 dark:border-gray-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
