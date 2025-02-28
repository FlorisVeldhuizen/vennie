import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  redirectPath?: string
}

const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to={redirectPath} replace />
  }
  
  // Render child routes if authenticated
  return <Outlet />
}

export default ProtectedRoute 