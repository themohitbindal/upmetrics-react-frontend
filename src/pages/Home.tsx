import { useState, useEffect } from 'react'
import { tasksApi } from '../api/tasks'
import { categoriesApi } from '../api/categories'
import { getTasksByCategory } from '../utils/taskUtils'
import type { Task, Category } from '../types/task'
import Header from '../components/Header'
import TaskBoard from '../components/TaskBoard'
import TaskModal from '../components/TaskModal'

function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()

  // Fetch categories and tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [categoriesResponse, tasksResponse] = await Promise.all([
          categoriesApi.getAll(),
          tasksApi.getAll(),
        ])
        setCategories(categoriesResponse.data)
        setTasks(tasksResponse.data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddTask = (categoryId: string) => {
    setSelectedTask(null)
    setDefaultCategoryId(categoryId)
    setIsModalOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDefaultCategoryId(undefined)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
    setError(null)
    
    // Extract category ID if category is an object
    const categoryId = typeof taskData.category === 'object' 
      ? taskData.category._id 
      : taskData.category

    try {
      if (selectedTask) {
        // Update existing task via API
        const response = await tasksApi.update(selectedTask._id, {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          category: categoryId,
        })
        // Update local state with returned task data
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === selectedTask._id ? response.data : task
          )
        )
      } else {
        // Create new task via API
        const response = await tasksApi.create({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          category: categoryId,
        })
        // Add returned task to local state
        setTasks((prevTasks) => [...prevTasks, response.data])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save task'
      setError(errorMessage)
      throw err // Re-throw to let modal handle it if needed
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setError(null)
    try {
      await tasksApi.delete(taskId)
      // Remove task from local state on success
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      setError(errorMessage)
      throw err // Re-throw to let modal handle it if needed
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setDefaultCategoryId(undefined)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Main Content - Task Boards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Horizontal Board Container */}
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
          {categories.map((category) => {
            const categoryTasks = getTasksByCategory(tasks, category._id)
            return (
              <TaskBoard
                key={category._id}
                category={category}
                tasks={categoryTasks}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
              />
            )
          })}
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
        task={selectedTask}
        categories={categories}
        defaultCategoryId={defaultCategoryId}
      />
    </div>
  )
}

export default Home
