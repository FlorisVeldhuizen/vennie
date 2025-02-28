import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { getCurrentUser } from '../lib/supabase'

interface ProtectedRouteProps {
  redirectPath?: string
}

const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { currentUser, setCurrentUser } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!currentUser) {
        try {
          const user = await getCurrentUser()
          if (user) {
            setCurrentUser({
              id: user.id,
              name: user.name || 'User'
            })
          }
        } catch (error) {
          console.error('Error checking auth:', error)
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [currentUser, setCurrentUser])
  
  // Show a loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  // If the user is not authenticated, redirect to the login page
  if (!currentUser) {
    return <Navigate to={redirectPath} replace />
  }
  
  // If the user is authenticated, render the child routes
  return <Outlet />
}

export default ProtectedRoute 