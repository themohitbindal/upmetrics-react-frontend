import apiClient from '../axios'
import { API_ENDPOINTS } from '../constants'
import type { ApiResponse } from '../types'

/**
 * User Service
 * Handles all user-related API calls
 * Matches backend API from API_INTEGRATION_PROMPT.md
 */

export interface UserProfile {
  _id: string
  email: string
  name?: string
  age?: number
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileData {
  name?: string
  age?: number
  profileImage?: string
  // Note: email cannot be updated according to backend
}

export const userService = {
  /**
   * Get user profile by ID
   * GET /api/users/:id
   */
  getProfile: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    return (await apiClient.get(API_ENDPOINTS.USER.BY_ID(userId))) as unknown as ApiResponse<UserProfile>
  },

  /**
   * Update user profile
   * PUT /api/users/:id
   * Note: Email cannot be updated
   */
  updateProfile: async (userId: string, data: UpdateProfileData): Promise<ApiResponse<UserProfile>> => {
    return (await apiClient.put(API_ENDPOINTS.USER.UPDATE(userId), data)) as unknown as ApiResponse<UserProfile>
  },
}

