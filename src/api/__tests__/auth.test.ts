import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, signIn, resetPassword } from '../auth'
import apiClient from '../axios'

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('Auth API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should send signup request with FormData', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'test-token',
          data: { _id: '1', email: 'test@example.com' },
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await signUp({ email: 'test@example.com', password: 'password123' })

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/signup', expect.any(FormData))
      expect(result).toEqual(mockResponse.data)
    })

    it('should include optional fields in FormData when provided', async () => {
      const mockResponse = {
        data: { success: true, token: 'test-token', data: { _id: '1' } },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await signUp({ email: 'test@example.com', password: 'pass', name: 'John', age: 25 })

      const formData = vi.mocked(apiClient.post).mock.calls[0][1] as FormData
      expect(formData.get('name')).toBe('John')
      expect(formData.get('age')).toBe('25')
    })
  })

  describe('signIn', () => {
    it('should send signin request with credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'test-token',
          data: { _id: '1', email: 'test@example.com' },
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await signIn({ email: 'test@example.com', password: 'password123' })

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resetPassword', () => {
    it('should send reset password request', async () => {
      const mockResponse = {
        data: { success: true, message: 'Password reset successful' },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await resetPassword('test@example.com', 'newpassword')

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        email: 'test@example.com',
        password: 'newpassword',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })
})
