import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KnowAllRates - Gold Rates Tracker",
  description: "Track live gold rates, historical data, and predictions for 22K and 24K gold",
  keywords: "gold rates, 22k gold, 24k gold, gold price, gold prediction, live rates",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
