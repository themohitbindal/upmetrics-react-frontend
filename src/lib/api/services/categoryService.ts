import apiClient from '../axios'
import { API_ENDPOINTS } from '../constants'
import type { ApiResponse } from '../types'

/**
 * Category Service
 * Handles all category-related API calls
 * Matches backend API from API_INTEGRATION_PROMPT.md
 * Note: Update and Delete are NOT allowed (405 Method Not Allowed)
 */

export interface Category {
  _id: string
  name: string
  slug: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  slug: string
}

export const categoryService = {
  /**
   * Get all categories
   * GET /api/categories
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return (await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE)) as unknown as ApiResponse<Category[]>
  },

  /**
   * Create new category
   * POST /api/categories
   */
  createCategory: async (data: CreateCategoryData): Promise<ApiResponse<Category>> => {
    return (await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, data)) as unknown as ApiResponse<Category>
  },
}

