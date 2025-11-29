import { Link } from 'react-router-dom'

interface LinkTextProps {
  to: string
  children: React.ReactNode
  color?: 'indigo' | 'purple' | 'green'
  className?: string
}

function LinkText({ to, children, color = 'indigo', className = '' }: LinkTextProps) {
  const colorClasses = {
    indigo: 'text-indigo-600 hover:text-indigo-500',
    purple: 'text-purple-600 hover:text-purple-500',
    green: 'text-green-600 hover:text-green-500',
  }

  return (
    <Link
      to={to}
      className={`text-sm font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </Link>
  )
}

export default LinkText

