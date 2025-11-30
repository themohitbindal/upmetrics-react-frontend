import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  gradient?: 'blue' | 'purple' | 'green'
}

function AuthLayout({ children, gradient = 'blue' }: AuthLayoutProps) {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-100',
    green: 'bg-gradient-to-br from-green-50 to-emerald-100',
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${gradientClasses[gradient]} px-4 py-8`}>
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout

