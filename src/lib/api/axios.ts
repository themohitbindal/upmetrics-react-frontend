import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from './constants'
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
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookies
    const token = cookieUtils.getToken()
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
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
          // Unauthorized - clear token and redirect to login
          cookieUtils.clearAuth()
          // Redirect to login page
          window.location.href = '/login'
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

