import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAll, getById, create, update, deleteTask } from '../tasks'
import apiClient from '../axios'

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Tasks API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all tasks without filter', async () => {
      const mockResponse = {
        data: { success: true, count: 2, data: [{ _id: '1' }, { _id: '2' }] },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getAll()

      expect(apiClient.get).toHaveBeenCalledWith('/api/tasks', { params: undefined })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch tasks filtered by categoryId', async () => {
      const mockResponse = {
        data: { success: true, count: 1, data: [{ _id: '1' }] },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getAll('cat-123')

      expect(apiClient.get).toHaveBeenCalledWith('/api/tasks', { params: { categoryId: 'cat-123' } })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getById', () => {
    it('should fetch a single task by ID', async () => {
      const mockResponse = {
        data: { success: true, data: { _id: 'task-1', title: 'Test Task' } },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await getById('task-1')

      expect(apiClient.get).toHaveBeenCalledWith('/api/tasks/task-1')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('create', () => {
    it('should create a new task', async () => {
      const mockResponse = {
        data: { success: true, data: { _id: 'new-task', title: 'New Task' } },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const taskData = { title: 'New Task', category: 'cat-1' }
      const result = await create(taskData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/tasks', taskData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('update', () => {
    it('should update an existing task', async () => {
      const mockResponse = {
        data: { success: true, data: { _id: 'task-1', title: 'Updated Task' } },
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const updateData = { title: 'Updated Task' }
      const result = await update('task-1', updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/api/tasks/task-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockResponse = {
        data: { success: true, message: 'Task deleted' },
      }
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)

      const result = await deleteTask('task-1')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/tasks/task-1')
      expect(result).toEqual(mockResponse.data)
    })
  })
})
