import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// TODO: Replace with production URL when deploying
const BASE_URL = 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Remove Content-Type header for FormData to allow browser to set multipart boundaries
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login page
      window.location.href = '/login'
    }

    // Return standardized error object
    const errorMessage = 
      (error.response?.data as { message?: string })?.message || 
      error.message || 
      'An unexpected error occurred'

    return Promise.reject({
      success: false,
      message: errorMessage,
    })
  }
)

export default apiClient
