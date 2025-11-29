import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { cookieUtils } from '../utils/cookies'
import { authService, type UserData } from '../lib/api/services/authService'
import type { ApiError } from '../lib/api/types'

interface AuthContextType {
  user: UserData | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  resetPassword: (email: string, password: string) => Promise<void>
  updateUser: (userData: Partial<UserData>) => void
}

interface SignupData {
  email: string
  password: string
  name?: string
  age?: number
  profileImage?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user and token from cookies on mount
  useEffect(() => {
    const savedToken = cookieUtils.getToken()
    const savedUser = cookieUtils.getUser()

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.signin({ email, password })
      
      if (response.success && response.token) {
        cookieUtils.setToken(response.token)
        cookieUtils.setUser(response.data)
        setToken(response.token)
        setUser(response.data)
      } else {
        throw new Error('Login failed')
      }
    } catch (error: any) {
      const apiError = error as ApiError
      throw new Error(apiError.message || 'Login failed. Please check your credentials.')
    }
  }

  const signup = async (data: SignupData) => {
    try {
      const response = await authService.signup(data)
      
      if (response.success && response.token) {
        cookieUtils.setToken(response.token)
        cookieUtils.setUser(response.data)
        setToken(response.token)
        setUser(response.data)
      } else {
        throw new Error('Signup failed')
      }
    } catch (error: any) {
      const apiError = error as ApiError
      throw new Error(apiError.message || 'Signup failed. Please try again.')
    }
  }

  const resetPassword = async (email: string, password: string) => {
    try {
      const response = await authService.resetPassword({ email, password })
      if (!response.success) {
        throw new Error('Password reset failed')
      }
    } catch (error: any) {
      const apiError = error as ApiError
      throw new Error(apiError.message || 'Password reset failed. Please try again.')
    }
  }

  const logout = () => {
    cookieUtils.clearAuth()
    setToken(null)
    setUser(null)
  }

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      cookieUtils.setUser(updatedUser) // Update cookie as well
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    resetPassword,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

