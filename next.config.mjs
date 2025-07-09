/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    GOLD_API_BASE_URL: process.env.GOLD_API_BASE_URL,
    GOLD_API_KEY: process.env.GOLD_API_KEY,
  }
}

export default nextConfig
