import type { Category, Task } from '../types/task'
import TaskCard from './TaskCard'

interface TaskBoardProps {
  category: Category
  tasks: Task[]
  onAddTask: (categoryId: string) => void
  onTaskClick: (task: Task) => void
}

function TaskBoard({ category, tasks, onAddTask, onTaskClick }: TaskBoardProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-4">
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
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
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
            <div key={task._id} onClick={() => onTaskClick(task)}>
              <TaskCard task={task} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TaskBoard

