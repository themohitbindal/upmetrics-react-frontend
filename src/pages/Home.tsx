import { useState } from 'react'
import { categories, tasks as initialTasks } from '../data/dummyData'
import { getTasksByCategory } from '../utils/taskUtils'
import type { Task } from '../types/task'
import Header from '../components/Header'
import TaskBoard from '../components/TaskBoard'
import TaskModal from '../components/TaskModal'

function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()

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

  const handleSaveTask = (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()

    if (selectedTask) {
      // Update existing task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTask._id
            ? {
                ...task,
                ...taskData,
                updatedAt: now,
              }
            : task
        )
      )
    } else {
      // Create new task
      const newTask: Task = {
        _id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...taskData,
        createdAt: now,
        updatedAt: now,
      }
      setTasks((prevTasks) => [...prevTasks, newTask])
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setDefaultCategoryId(undefined)
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
