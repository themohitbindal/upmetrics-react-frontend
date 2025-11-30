import apiClient from './axios'
import type {
  TaskResponse,
  TasksResponse,
  CreateTaskData,
  UpdateTaskData,
  DeleteResponse,
} from '../types/task'

/**
 * Get all tasks, optionally filtered by category
 * @param categoryId - Optional category ID to filter tasks
 * @returns TasksResponse with array of tasks
 */
export async function getAll(categoryId?: string): Promise<TasksResponse> {
  const params = categoryId ? { categoryId } : undefined
  const response = await apiClient.get<TasksResponse>('/api/tasks', { params })
  return response.data
}

/**
 * Get a single task by ID
 * @param taskId - Task ID
 * @returns TaskResponse with task data
 */
export async function getById(taskId: string): Promise<TaskResponse> {
  const response = await apiClient.get<TaskResponse>(`/api/tasks/${taskId}`)
  return response.data
}

/**
 * Create a new task
 * @param taskData - Task creation data
 * @returns TaskResponse with created task
 */
export async function create(taskData: CreateTaskData): Promise<TaskResponse> {
  const response = await apiClient.post<TaskResponse>('/api/tasks', taskData)
  return response.data
}

/**
 * Update an existing task
 * @param taskId - Task ID to update
 * @param taskData - Task update data
 * @returns TaskResponse with updated task
 */
export async function update(
  taskId: string,
  taskData: UpdateTaskData
): Promise<TaskResponse> {
  const response = await apiClient.put<TaskResponse>(`/api/tasks/${taskId}`, taskData)
  return response.data
}

/**
 * Delete a task
 * @param taskId - Task ID to delete
 * @returns DeleteResponse with success status
 */
export async function deleteTask(taskId: string): Promise<DeleteResponse> {
  const response = await apiClient.delete<DeleteResponse>(`/api/tasks/${taskId}`)
  return response.data
}

// Export as named object for convenient importing
export const tasksApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteTask,
}
