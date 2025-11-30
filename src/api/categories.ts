import apiClient from './axios'
import type {
  CategoryResponse,
  CategoriesResponse,
  CreateCategoryData,
} from '../types/task'

/**
 * Get all categories
 * @returns CategoriesResponse with array of categories
 */
export async function getAll(): Promise<CategoriesResponse> {
  const response = await apiClient.get<CategoriesResponse>('/api/categories')
  return response.data
}

/**
 * Create a new category
 * @param categoryData - Category creation data (name, optional slug)
 * @returns CategoryResponse with created category
 */
export async function create(
  categoryData: CreateCategoryData
): Promise<CategoryResponse> {
  const response = await apiClient.post<CategoryResponse>('/api/categories', categoryData)
  return response.data
}

// Export as named object for convenient importing
export const categoriesApi = {
  getAll,
  create,
}
