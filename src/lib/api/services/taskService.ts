import apiClient from '../axios'
import { API_ENDPOINTS } from '../constants'
import type { ApiResponse, PaginationParams } from '../types'
import type { Task } from '../../../types/task'

/**
 * Task Service
 * Handles all task-related API calls
 */

export interface CreateTaskData {
  title: string
  description: string
  status: Task['status']
  priority: Task['priority']
  category: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  _id: string
}

export interface TaskFilters extends PaginationParams {
  category?: string
  status?: Task['status']
  priority?: Task['priority']
}

export const taskService = {
  /**
   * Get all tasks with optional filters
   * GET /api/tasks?categoryId=xxx
   */
  getTasks: async (filters?: TaskFilters): Promise<ApiResponse<Task[]>> => {
    const params: Record<string, string> = {}
    if (filters?.category) {
      params.categoryId = filters.category
    }
    return (await apiClient.get(API_ENDPOINTS.TASKS.BASE, { params })) as unknown as ApiResponse<Task[]>
  },

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  getTaskById: async (id: string): Promise<ApiResponse<Task>> => {
    return (await apiClient.get(API_ENDPOINTS.TASKS.BY_ID(id))) as unknown as ApiResponse<Task>
  },

  /**
   * Get tasks by category
   * GET /api/tasks?categoryId=xxx
   */
  getTasksByCategory: async (categoryId: string): Promise<ApiResponse<Task[]>> => {
    return (await apiClient.get(API_ENDPOINTS.TASKS.BY_CATEGORY(categoryId))) as unknown as ApiResponse<Task[]>
  },

  /**
   * Create new task
   * POST /api/tasks
   */
  createTask: async (data: CreateTaskData): Promise<ApiResponse<Task>> => {
    return (await apiClient.post(API_ENDPOINTS.TASKS.BASE, data)) as unknown as ApiResponse<Task>
  },

  /**
   * Update task
   * PUT /api/tasks/:id
   */
  updateTask: async (id: string, data: Partial<CreateTaskData>): Promise<ApiResponse<Task>> => {
    return (await apiClient.put(API_ENDPOINTS.TASKS.BY_ID(id), data)) as unknown as ApiResponse<Task>
  },

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  deleteTask: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return (await apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(id))) as unknown as ApiResponse<{ message: string }>
  },
}

