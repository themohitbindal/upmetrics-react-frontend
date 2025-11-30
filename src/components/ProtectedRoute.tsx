import { Navigate } from 'react-router-dom'
import { cookieUtils } from '../utils/cookies'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = cookieUtils.getToken()

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
