import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getById, update } from '../users'
import apiClient from '../axios'

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('Users API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getById', () => {
    it('should fetch a user by ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            _id: 'user-1',
            email: 'test@example.com',
            name: 'John Doe',
            age: 30,
          },
        },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getById('user-1')

      expect(apiClient.get).toHaveBeenCalledWith('/api/users/user-1')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('update', () => {
    it('should update user profile with FormData', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { _id: 'user-1', name: 'Jane Doe', age: 25 },
        },
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await update('user-1', { name: 'Jane Doe', age: 25 })

      expect(apiClient.put).toHaveBeenCalledWith('/api/users/user-1', expect.any(FormData))
      expect(result).toEqual(mockResponse.data)
    })

    it('should include name in FormData when provided', async () => {
      const mockResponse = {
        data: { success: true, data: { _id: 'user-1' } },
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      await update('user-1', { name: 'Updated Name' })

      const formData = vi.mocked(apiClient.put).mock.calls[0][1] as FormData
      expect(formData.get('name')).toBe('Updated Name')
    })

    it('should include age in FormData when provided', async () => {
      const mockResponse = {
        data: { success: true, data: { _id: 'user-1' } },
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      await update('user-1', { age: 35 })

      const formData = vi.mocked(apiClient.put).mock.calls[0][1] as FormData
      expect(formData.get('age')).toBe('35')
    })

    it('should include profile image file when provided', async () => {
      const mockResponse = {
        data: { success: true, data: { _id: 'user-1' } },
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const imageFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' })
      await update('user-1', {}, imageFile)

      const formData = vi.mocked(apiClient.put).mock.calls[0][1] as FormData
      expect(formData.get('profileImage')).toBe(imageFile)
    })
  })
})
