import type { Task } from '../types/task'
import { getPriorityColor, getStatusColor } from '../utils/taskUtils'

interface TaskCardProps {
  task: Task
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1">{task.title}</h4>
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor(task.status)} ml-2 flex-shrink-0 mt-1`}
          title={task.status}
        />
      </div>

      {/* Task Description */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(task.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export default TaskCard

