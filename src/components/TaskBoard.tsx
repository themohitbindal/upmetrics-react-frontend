import { useState } from 'react'
import type { Category, Task } from '../types/task'
import TaskCard from './TaskCard'

interface TaskBoardProps {
  category: Category
  tasks: Task[]
  onAddTask: (categoryId: string) => void
  onTaskClick: (task: Task) => void
  onTaskDrop?: (taskId: string, newCategoryId: string) => void
  onDragStart?: (task: Task) => void
  onDragEnd?: () => void
}

function TaskBoard({ 
  category, 
  tasks, 
  onAddTask, 
  onTaskClick, 
  onTaskDrop,
  onDragStart,
  onDragEnd 
}: TaskBoardProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the board container
    if (e.currentTarget === e.target) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId && onTaskDrop) {
      onTaskDrop(taskId, category._id)
    }
  }

  return (
    <div
      className={`flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-4 transition-colors ${
        isDragOver ? 'bg-indigo-50 border-2 border-indigo-300 border-dashed' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Board Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <button
            onClick={() => onAddTask(category._id)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
            title="Add Task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tasks Container - Vertical */}
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar px-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm mb-3">No tasks in this category</p>
            <button
              onClick={() => onAddTask(category._id)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add your first task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task._id}
              className="relative py-1"
              onClick={() => {
                // Only trigger click if this task wasn't just dragged
                if (draggedTaskId !== task._id) {
                  onTaskClick(task)
                }
              }}
            >
              <TaskCard 
                task={task} 
                onDragStart={(t) => {
                  setDraggedTaskId(t._id)
                  if (onDragStart) onDragStart(t)
                }}
                onDragEnd={() => {
                  // Reset after a short delay to allow click to work
                  setTimeout(() => {
                    setDraggedTaskId(null)
                  }, 100)
                  if (onDragEnd) onDragEnd()
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TaskBoard

