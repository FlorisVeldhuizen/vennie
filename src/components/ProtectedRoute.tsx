import { Navigate, Outlet } from 'react-router-dom'
import { useStore } from '../store/useStore'

interface ProtectedRouteProps {
  redirectPath?: string
}

const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { currentUser } = useStore()
  
  // If the user is not authenticated, redirect to the login page
  if (!currentUser) {
    return <Navigate to={redirectPath} replace />
  }
  
  // If the user is authenticated, render the child routes
  return <Outlet />
}

export default ProtectedRoute 