import React from 'react'

interface FormCardProps {
  children: React.ReactNode
  className?: string
}

function FormCard({ children, className = '' }: FormCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}>
      {children}
    </div>
  )
}

export default FormCard

