import { useState, useRef } from 'react'
import type { Task } from '../types/task'
import { getPriorityColor, getStatusColor } from '../utils/taskUtils'

interface TaskCardProps {
  task: Task
  onDragStart?: (task: Task) => void
  onDragEnd?: () => void
}

function TaskCard({ task, onDragStart, onDragEnd }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragImageRef = useRef<HTMLElement | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task._id)
    // Store task data for easier access
    e.dataTransfer.setData('application/json', JSON.stringify(task))

    // Create a custom drag image for better visibility
    const originalElement = e.currentTarget
    const dragImage = originalElement.cloneNode(true) as HTMLElement

    // Style the drag image to be HIGHLY visible and clear
    dragImage.style.width = `${originalElement.offsetWidth}px`
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.style.left = '-1000px'
    dragImage.style.opacity = '1'
    dragImage.style.transform = 'rotate(1deg) scale(1.25)'
    dragImage.style.boxShadow = '0 40px 80px -12px rgba(99, 102, 241, 0.7), 0 0 0 6px rgba(99, 102, 241, 0.5), 0 30px 40px -5px rgba(0, 0, 0, 0.5)'
    dragImage.style.border = '5px solid #6366f1'
    dragImage.style.borderRadius = '0.5rem'
    dragImage.style.backgroundColor = '#ffffff'
    dragImage.style.zIndex = '99999'
    dragImage.style.pointerEvents = 'none'
    dragImage.style.cursor = 'grabbing'
    dragImage.style.filter = 'brightness(1.25) saturate(1.3) contrast(1.2)'
    dragImage.style.backdropFilter = 'blur(0px)'

    // Force white background on all child elements
    const allElements = dragImage.querySelectorAll('*')
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.opacity = '1'

      // Ensure background is white for text containers
      if (htmlEl.tagName === 'DIV' && !htmlEl.style.backgroundColor) {
        htmlEl.style.backgroundColor = 'transparent'
      }
    })

    // Specifically enhance title visibility - make it VERY bold and dark
    const titleElements = dragImage.querySelectorAll('h4')
    titleElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.color = '#000000'
      htmlEl.style.fontWeight = '800'
      htmlEl.style.fontSize = '0.95rem'
      htmlEl.style.textShadow = '0 2px 4px rgba(255, 255, 255, 1), 0 0 0 rgba(0, 0, 0, 0.1)'
      htmlEl.style.letterSpacing = '0.01em'
    })

    // Make description text very visible
    const descElements = dragImage.querySelectorAll('p')
    descElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.color = '#1f2937'
      htmlEl.style.fontWeight = '600'
      htmlEl.style.fontSize = '0.8rem'
      htmlEl.style.textShadow = '0 1px 3px rgba(255, 255, 255, 1)'
      htmlEl.style.lineHeight = '1.5'
    })

    // Enhance badge/priority visibility - make them stand out
    const badgeElements = dragImage.querySelectorAll('span')
    badgeElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.className.includes('px-2') || htmlEl.className.includes('py-1')) {
        htmlEl.style.borderWidth = '2px'
        htmlEl.style.fontWeight = '700'
        htmlEl.style.fontSize = '0.75rem'
        htmlEl.style.textShadow = 'none'
      }
    })

    // Make date text more visible
    const dateElements = dragImage.querySelectorAll('span.text-gray-400, span.text-xs')
    dateElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.textContent && /^\d{2}\/\d{2}\/\d{4}/.test(htmlEl.textContent.trim())) {
        htmlEl.style.color = '#4b5563'
        htmlEl.style.fontWeight = '600'
        htmlEl.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.9)'
      }
    })

    // Enhance status dot visibility
    const statusDots = dragImage.querySelectorAll('[class*="rounded-full"]')
    statusDots.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.width = '10px'
      htmlEl.style.height = '10px'
      htmlEl.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.8)'
    })

    document.body.appendChild(dragImage)
    dragImageRef.current = dragImage

    // Set the custom drag image with offset from cursor
    const rect = originalElement.getBoundingClientRect()
    const offsetX = rect.width / 2
    const offsetY = rect.height / 2
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY)

    if (onDragStart) {
      onDragStart(task)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    // Clean up the drag image
    if (dragImageRef.current && document.body.contains(dragImageRef.current)) {
      document.body.removeChild(dragImageRef.current)
      dragImageRef.current = null
    }

    if (onDragEnd) {
      onDragEnd()
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all ${isDragging
        ? 'opacity-60 scale-95 border-2 border-dashed border-indigo-400 bg-indigo-50 cursor-grabbing'
        : 'hover:scale-[1.03] hover:border-indigo-400 hover:shadow-xl hover:z-10 cursor-grab'
        }`}
      style={{
        transformOrigin: 'center center',
      }}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-indigo-500 text-xs font-medium opacity-60">
            Moving...
          </div>
        </div>
      )}
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

