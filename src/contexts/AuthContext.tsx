import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, SignUpData, SignInData } from '../types/user'
import { signIn as apiSignIn, signUp as apiSignUp } from '../api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignUpData, imageFile?: File) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const credentials: SignInData = { email, password }
    const response = await apiSignIn(credentials)
    
    // Store in localStorage
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.data))
    
    // Update state
    setToken(response.token)
    setUser(response.data)
  }, [])

  const signup = useCallback(async (data: SignUpData, imageFile?: File) => {
    const response = await apiSignUp(data, imageFile)
    
    // Store in localStorage
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.data))
    
    // Update state
    setToken(response.token)
    setUser(response.data)
  }, [])

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Reset state
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
