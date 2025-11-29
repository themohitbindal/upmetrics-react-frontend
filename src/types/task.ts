export interface Task {
  _id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: string
  updatedAt: string
}

export interface TaskResponse {
  success: boolean
  count: number
  data: Task[]
}

export interface Category {
  _id: string
  name: string
}

