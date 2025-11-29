import { Link } from 'react-router-dom'

interface SuccessMessageProps {
  title: string
  message: string
  linkTo: string
  linkText: string
  linkColor?: 'indigo' | 'purple' | 'green'
}

function SuccessMessage({
  title,
  message,
  linkTo,
  linkText,
  linkColor = 'green',
}: SuccessMessageProps) {
  const iconColorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  }

  const linkColorClasses = {
    indigo: 'text-indigo-600 hover:text-indigo-500',
    purple: 'text-purple-600 hover:text-purple-500',
    green: 'text-green-600 hover:text-green-500',
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconColorClasses[linkColor]} mb-4`}>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{message}</p>
      </div>
      <Link
        to={linkTo}
        className={`inline-block text-sm font-medium ${linkColorClasses[linkColor]}`}
      >
        {linkText}
      </Link>
    </div>
  )
}

export default SuccessMessage

