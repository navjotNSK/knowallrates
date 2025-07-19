import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Updated type definition for params
type RouteParams = {
  params: Promise<{ filename: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // const authHeader = request.headers.get("authorization")
    
    // if (!authHeader) {
    //   return NextResponse.json({ message: "Authorization required" }, { status: 401 })
    // }

    // Await the params
    const { filename } = await params
    
    // Validate filename to prevent directory traversal attacks
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ message: "Invalid filename" }, { status: 400 })
    }

    // Try to serve from backend first
    let backendUrl = process.env.GOLD_API_BASE_URL || "http://localhost:8080"
    backendUrl = backendUrl.replace(/\/$/, "")

    try {
      const response = await fetch(`${backendUrl}/api/uploads/products/${filename}`, {
        method: "GET",
        // headers: {
        //   Authorization: authHeader,
        // },
        cache: "no-store",
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/jpeg"
        const imageBuffer = await response.arrayBuffer()
        
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      }
    } catch (backendError) {
      console.error("Backend image fetch failed:", backendError)
    }

    // Fallback: try to serve from local uploads directory
    const uploadsPath = path.join(process.cwd(), "public", "uploads", "products")
    const imagePath = path.join(uploadsPath, filename)

    try {
      // Check if file exists and is within the uploads directory
      const resolvedPath = path.resolve(imagePath)
      const uploadsDir = path.resolve(uploadsPath)
      
      if (!resolvedPath.startsWith(uploadsDir)) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 })
      }

      const imageBuffer = await fs.readFile(imagePath)
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase()
      const contentTypeMap: { [key: string]: string } = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
      }
      
      const contentType = contentTypeMap[ext] || "image/jpeg"
      
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Data-Source": "local-fallback",
        },
      })
    } catch (fileError) {
      console.error("Local file read failed:", fileError)
    }

    // Final fallback: return placeholder image
    return NextResponse.redirect(new URL("/placeholder.svg?height=300&width=300", request.url))
    
  } catch (error) {
    console.error("Error serving product image:", error)
    return NextResponse.json(
      { message: "Error serving image" },
      { status: 500 }
    )
  }
}