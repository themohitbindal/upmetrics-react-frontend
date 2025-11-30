import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAll, create } from '../categories'
import apiClient from '../axios'

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Categories API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all categories', async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 2,
          data: [
            { _id: '1', name: 'Development', slug: 'development' },
            { _id: '2', name: 'Design', slug: 'design' },
          ],
        },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getAll()

      expect(apiClient.get).toHaveBeenCalledWith('/api/categories')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('create', () => {
    it('should create a new category', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { _id: 'new-cat', name: 'Marketing', slug: 'marketing' },
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const categoryData = { name: 'Marketing', slug: 'marketing' }
      const result = await create(categoryData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/categories', categoryData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should create a category without optional slug', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { _id: 'new-cat', name: 'Sales' },
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const categoryData = { name: 'Sales' }
      const result = await create(categoryData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/categories', categoryData)
      expect(result).toEqual(mockResponse.data)
    })
  })
})
