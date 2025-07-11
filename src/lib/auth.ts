interface User {
  id: number
  email: string
  fullName: string
  mobileNo: string
  dateOfBirth?: string
  address?: string
  role: string
}

interface AuthResponse {
  token: string
  type: string
  user: User
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token"
  private readonly USER_KEY = "auth_user"

  setAuth(authResponse: AuthResponse) {
    if (authResponse.token && authResponse.user) {
      localStorage.setItem(this.TOKEN_KEY, authResponse.token)
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user))
      console.log("Auth data saved:", {
        token: authResponse.token.substring(0, 20) + "...",
        user: authResponse.user.email,
        role: authResponse.user.role,
      })
    } else {
      console.error("Invalid auth response:", authResponse)
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY)
    if (token) {
      console.log("Retrieved token:", token.substring(0, 20) + "...")
    }
    return token
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        console.log("Retrieved user:", user.email, "role:", user.role)
        return user
      } catch (e) {
        console.error("Error parsing user data:", e)
        this.logout()
        return null
      }
    }
    return null
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()
    const authenticated = !!(token && user)
    console.log("Authentication check:", authenticated)
    return authenticated
  }

  isAdmin(): boolean {
    const user = this.getUser()
    const isAdmin = user?.role === "ADMIN"
    console.log("Admin check:", isAdmin, "user role:", user?.role)
    return isAdmin
  }

  logout() {
    console.log("Logging out user")
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  getAuthHeaders() {
    const token = this.getToken()
    if (token) {
      const headers = { Authorization: `Bearer ${token}` }
      console.log("Auth headers created:", { Authorization: `Bearer ${token.substring(0, 20)}...` })
      return headers
    }
    console.log("No token available for auth headers")
    return {}
  }
}

export const authService = new AuthService()
export type { User, AuthResponse }
