interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
}

function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  )
}

export default PageHeader

