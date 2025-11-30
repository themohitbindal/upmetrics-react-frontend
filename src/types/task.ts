export interface Category {
  _id: string
  name: string
  slug?: string
  isSystem?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Task {
  _id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string | Category
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  category: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  category?: string
}

export interface TaskResponse {
  success: boolean
  data: Task
}

export interface TasksResponse {
  success: boolean
  count: number
  data: Task[]
}

export interface CategoryResponse {
  success: boolean
  data: Category
}

export interface CategoriesResponse {
  success: boolean
  count: number
  data: Category[]
}

export interface CreateCategoryData {
  name: string
  slug?: string
}

export interface DeleteResponse {
  success: boolean
  message?: string
}

export interface UserResponse {
  success: boolean
  data: import('./user').User
}

