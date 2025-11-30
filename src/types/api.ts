import type { User } from './user'

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiListResponse<T> {
  success: boolean
  count: number
  data: T[]
}

export interface AuthResponse {
  success: boolean
  token: string
  data: User
}

export interface MessageResponse {
  success: boolean
  message: string
}

export interface ApiError {
  success: false
  message: string
}
