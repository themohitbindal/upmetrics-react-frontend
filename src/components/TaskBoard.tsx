import type { Category, Task } from '../types/task'
import TaskCard from './TaskCard'

interface TaskBoardProps {
  category: Category
  tasks: Task[]
}

function TaskBoard({ category, tasks }: TaskBoardProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-4">
      {/* Board Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Tasks Container - Vertical */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No tasks in this category</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task._id} task={task} />)
        )}
      </div>
    </div>
  )
}

export default TaskBoard

