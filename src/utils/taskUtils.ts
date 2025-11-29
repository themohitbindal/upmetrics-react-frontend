import type { Task } from '../types/task'

/**
 * Get tasks filtered by category ID
 */
export const getTasksByCategory = (tasks: Task[], categoryId: string): Task[] => {
  return tasks.filter((task) => task.category === categoryId)
}

/**
 * Get CSS classes for priority badge styling
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get CSS classes for status indicator styling
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'in-progress':
      return 'bg-blue-500'
    case 'pending':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

