import apiClient from '../axios'
import { API_ENDPOINTS } from '../constants'
import type { AuthApiResponse, ApiResponse } from '../types'

/**
 * Auth Service
 * Handles all authentication-related API calls
 * Matches backend API from API_INTEGRATION_PROMPT.md
 */

export interface SigninCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name?: string
  age?: number
  profileImage?: string
}

export interface UserData {
  _id: string
  email: string
  name?: string
  age?: number
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export interface ResetPasswordData {
  email: string
  password: string
}

export const authService = {
  /**
   * Sign up new user
   * POST /api/auth/signup
   */
  signup: async (data: SignupData): Promise<AuthApiResponse<UserData>> => {
    return (await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data)) as unknown as AuthApiResponse<UserData>
  },

  /**
   * Sign in (Login) user
   * POST /api/auth/signin
   */
  signin: async (credentials: SigninCredentials): Promise<AuthApiResponse<UserData>> => {
    return (await apiClient.post(API_ENDPOINTS.AUTH.SIGNIN, credentials)) as unknown as AuthApiResponse<UserData>
  },

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> => {
    return (await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)) as unknown as ApiResponse<{ message: string }>
  },

  /**
   * Logout user (client-side only)
   * Clears token from cookies
   */
  logout: (): void => {
    // This is handled by AuthContext, but kept for consistency
  },
}

