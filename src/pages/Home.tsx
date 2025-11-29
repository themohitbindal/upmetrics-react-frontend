import { useState, useEffect } from 'react'
import { getTasksByCategory } from '../utils/taskUtils'
import { taskService } from '../lib/api/services/taskService'
import { categoryService } from '../lib/api/services/categoryService'
import type { Task } from '../types/task'
import type { Category } from '../types/task'
import Header from '../components/Header'
import TaskBoard from '../components/TaskBoard'
import TaskModal from '../components/TaskModal'

function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks and categories on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch categories and tasks in parallel
      const [categoriesRes, tasksRes] = await Promise.all([
        categoryService.getCategories(),
        taskService.getTasks(),
      ])

      if (categoriesRes.success) {
        setCategories(categoriesRes.data)
      }

      if (tasksRes.success) {
        setTasks(tasksRes.data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data. Please try again.')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

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
    try {
      setError(null)

      // Extract category ID - ensure it's a string
      const categoryId = typeof taskData.category === 'string' 
        ? taskData.category 
        : taskData.category._id

      // Prepare data for API (category must be string ID)
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        category: categoryId,
      }

      if (selectedTask) {
        // Update existing task
        const response = await taskService.updateTask(selectedTask._id, apiTaskData)
        if (response.success) {
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === selectedTask._id ? response.data : task))
          )
          handleCloseModal()
        } else {
          throw new Error('Failed to update task')
        }
      } else {
        // Create new task
        const response = await taskService.createTask(apiTaskData)
        if (response.success) {
          setTasks((prevTasks) => [...prevTasks, response.data])
          handleCloseModal()
        } else {
          throw new Error('Failed to create task')
        }
      }
    } catch (err: any) {
      // Keep form data and show error - don't close modal
      setError(err.message || 'Failed to save task. Please check your input and try again.')
      console.error('Error saving task:', err)
      // Re-throw error so TaskModal knows to keep modal open
      throw err
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null)
      const response = await taskService.deleteTask(taskId)
      if (response.success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
        handleCloseModal()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task. Please try again.')
      console.error('Error deleting task:', err)
    }
  }

  const handleTaskDrop = async (taskId: string, newCategoryId: string) => {
    try {
      setError(null)

      // Find the task being moved
      const taskToMove = tasks.find((task) => task._id === taskId)
      if (!taskToMove) {
        throw new Error('Task not found')
      }

      // Check if task is already in the target category
      const currentCategoryId = typeof taskToMove.category === 'string'
        ? taskToMove.category
        : taskToMove.category._id

      if (currentCategoryId === newCategoryId) {
        // Task is already in this category, no need to update
        return
      }

      // Optimistically update the UI
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === taskId) {
            // Update the category to the new one
            return {
              ...task,
              category: newCategoryId,
            }
          }
          return task
        })
      )

      // Update task category via API
      const response = await taskService.updateTask(taskId, {
        category: newCategoryId,
        title: taskToMove.title,
        description: taskToMove.description,
        status: taskToMove.status,
        priority: taskToMove.priority,
      })

      if (response.success) {
        // Update with the response data from server
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === taskId ? response.data : task))
        )
      } else {
        // Revert optimistic update on error
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task._id === taskId) {
              return taskToMove // Restore original task
            }
            return task
          })
        )
        throw new Error(response.message || 'Failed to move task')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to move task. Please try again.')
      console.error('Error moving task:', err)
    }
  }

  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setDefaultCategoryId(undefined)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Main Content - Task Boards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          </div>
        ) : (
          /* Horizontal Board Container */
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
            {categories.length === 0 ? (
              <div className="w-full text-center py-12">
                <p className="text-gray-600">No categories available. Please create a category first.</p>
              </div>
            ) : (
              categories.map((category) => {
                const categoryTasks = getTasksByCategory(tasks, category._id)
                return (
                  <TaskBoard
                    key={category._id}
                    category={category}
                    tasks={categoryTasks}
                    onAddTask={handleAddTask}
                    onTaskClick={handleTaskClick}
                    onTaskDrop={handleTaskDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                )
              })
            )}
          </div>
        )}
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
