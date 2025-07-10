/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  env: {
    GOLD_API_BASE_URL: process.env.GOLD_API_BASE_URL,
    GOLD_API_KEY: process.env.GOLD_API_KEY,
  },
  // Enable standalone output for Railway
  output: "standalone",
}

module.exports = nextConfig
