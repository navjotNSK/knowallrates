"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Clock, Shield, RefreshCw } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Submitting forgot password request for:", email)

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("Forgot password response:", data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }

      setSuccess(true)
      setEmailSent(email)

      // Start cooldown timer for resend
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      console.error("Forgot password error:", err)
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setSuccess(false)
    setError("")
    // Keep the email filled for convenience
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">Check Your Email</CardTitle>
            <CardDescription className="dark:text-gray-300">
              We've sent a password reset link to{" "}
              <strong className="text-green-600 dark:text-green-400">{emailSent}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <strong>What's next?</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create your new password</li>
                  <li>• Sign in with your new credentials</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                <strong>Important:</strong> The reset link will expire in <strong>1 hour</strong> for security reasons.
                If you don't see the email within a few minutes, check your spam folder.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>

              {resendCooldown > 0 ? (
                <Button
                  variant="outline"
                  disabled
                  className="w-full dark:border-gray-600 dark:text-gray-400 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend in {resendCooldown}s
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleResend}
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Email
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the email?{" "}
                <button
                  onClick={handleResend}
                  className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium underline"
                  disabled={resendCooldown > 0}
                >
                  Try again
                </button>{" "}
                or{" "}
                <Link
                  href="/contact"
                  className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium underline"
                >
                  contact support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/signin")}
            className="absolute top-4 left-4 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Forgot Password?</CardTitle>
          <CardDescription className="dark:text-gray-300">
            No worries! Enter your email address and we'll send you a secure link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email address"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
                autoComplete="email"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll send a reset link to this email address if it's registered with us.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send Reset Link</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <Alert className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <AlertDescription className="text-gray-700 dark:text-gray-300">
                <strong>Security Note:</strong> For your protection, we'll only send reset links to registered email
                addresses. The link will expire in 1 hour.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Having trouble?{" "}
                <Link href="/contact" className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 underline">
                  Contact our support team
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
