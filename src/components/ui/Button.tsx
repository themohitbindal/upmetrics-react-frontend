import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  color?: 'indigo' | 'purple' | 'green'
  fullWidth?: boolean
}

function Button({
  children,
  variant = 'primary',
  color = 'indigo',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition'
  
  const colorClasses = {
    indigo: variant === 'primary' 
      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500',
    purple: variant === 'primary'
      ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
      : 'bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-500',
    green: variant === 'primary'
      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
      : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseClasses} ${colorClasses[color]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

