import { categories, tasks } from '../data/dummyData'
import { getTasksByCategory } from '../utils/taskUtils'
import Header from '../components/Header'
import TaskBoard from '../components/TaskBoard'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Main Content - Task Boards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Horizontal Board Container */}
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
          {categories.map((category) => {
            const categoryTasks = getTasksByCategory(tasks, category._id)
            return <TaskBoard key={category._id} category={category} tasks={categoryTasks} />
          })}
        </div>
      </main>
    </div>
  )
}

export default Home
