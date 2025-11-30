import apiClient from './axios'
import type { UserResponse } from '../types/task'
import type { UpdateUserData } from '../types/user'

/**
 * Get user by ID
 * @param userId - User ID
 * @returns UserResponse with user data
 */
export async function getById(userId: string): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`/api/users/${userId}`)
  return response.data
}

/**
 * Update user profile
 * @param userId - User ID to update
 * @param userData - User update data (name, age)
 * @param imageFile - Optional profile image file
 * @returns UserResponse with updated user data
 */
export async function update(
  userId: string,
  userData: UpdateUserData,
  imageFile?: File
): Promise<UserResponse> {
  const formData = new FormData()
  
  if (userData.name !== undefined) {
    formData.append('name', userData.name)
  }
  if (userData.age !== undefined) {
    formData.append('age', String(userData.age))
  }
  if (imageFile) {
    formData.append('profileImage', imageFile)
  }

  const response = await apiClient.put<UserResponse>(`/api/users/${userId}`, formData)
  return response.data
}

// Export as named object for convenient importing
export const usersApi = {
  getById,
  update,
}
