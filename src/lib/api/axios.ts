import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from './constants'
import type { ApiError } from './types'
import { cookieUtils } from '../../utils/cookies'

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * Add auth token to requests if available
 * Redirect to login if token is missing for protected endpoints
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookies
    const token = cookieUtils.getToken()
    
    // Check if this is a public (auth) endpoint that doesn't require a token
    const isPublicEndpoint = 
      config.url?.includes(API_ENDPOINTS.AUTH.SIGNUP) ||
      config.url?.includes(API_ENDPOINTS.AUTH.SIGNIN) ||
      config.url?.includes(API_ENDPOINTS.AUTH.RESET_PASSWORD)

    // If no token and trying to access a protected endpoint, redirect to login
    if (!token && !isPublicEndpoint) {
      const currentPath = window.location.pathname
      const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(currentPath)
      
      // Only redirect if not already on an auth page
      if (!isAuthPage) {
        cookieUtils.clearAuth() // Clear any stale auth data
        window.location.href = '/login'
        // Throw error to prevent the request from being sent
        throw new Error('No authentication token found. Redirecting to login.')
      }
    }
    
    // Add token to request if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handle common errors and transform responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly if response has data property
    // This transforms AxiosResponse<T> to T
    return (response.data || response) as any
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = {
        message: error.response.data?.message || error.message,
        errors: error.response.data?.errors,
        statusCode: error.response.status,
      }

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token
          cookieUtils.clearAuth()
          // Only redirect if not already on an auth page or profile page
          // Profile page should handle its own errors without redirecting
          const currentPath = window.location.pathname
          const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(currentPath)
          const isProfilePage = currentPath === '/profile'
          
          if (!isAuthPage && !isProfilePage) {
            // Redirect to login page only if not on auth pages or profile page
            window.location.href = '/login'
          }
          // If on profile page, let the component handle the error
          break
        case 403:
          // Forbidden
          console.error('Access forbidden')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error occurred')
          break
      }

      return Promise.reject(apiError)
    } else if (error.request) {
      // Request was made but no response received
      const apiError: ApiError = {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      }
      return Promise.reject(apiError)
    } else {
      // Something else happened
      const apiError: ApiError = {
        message: error.message || 'An unexpected error occurred',
      }
      return Promise.reject(apiError)
    }
  }
)

export default apiClient

