import apiClient from './axios'
import type { AuthResponse, MessageResponse } from '../types/api'
import type { SignUpData, SignInData } from '../types/user'

/**
 * Sign up a new user
 * @param data - User signup data (email, password, name, age)
 * @param imageFile - Optional profile image file
 * @returns AuthResponse with token and user data
 */
export async function signUp(
  data: SignUpData,
  imageFile?: File
): Promise<AuthResponse> {
  const formData = new FormData()
  formData.append('email', data.email)
  formData.append('password', data.password)
  
  if (data.name) {
    formData.append('name', data.name)
  }
  if (data.age !== undefined) {
    formData.append('age', String(data.age))
  }
  if (imageFile) {
    formData.append('profileImage', imageFile)
  }

  const response = await apiClient.post<AuthResponse>('/api/auth/signup', formData)
  return response.data
}

/**
 * Sign in an existing user
 * @param credentials - User login credentials (email, password)
 * @returns AuthResponse with token and user data
 */
export async function signIn(credentials: SignInData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/signin', credentials)
  return response.data
}

/**
 * Reset user password
 * @param email - User email address
 * @param password - New password
 * @returns MessageResponse with success message
 */
export async function resetPassword(
  email: string,
  password: string
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/api/auth/reset-password', {
    email,
    password,
  })
  return response.data
}
