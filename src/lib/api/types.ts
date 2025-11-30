/**
 * Base API Response Types
 * Matches backend API response structure
 */

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  count?: number
}

/**
 * Auth Response - token is at root level, not in data
 */
export interface AuthApiResponse<T> {
  success: boolean
  token: string
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

