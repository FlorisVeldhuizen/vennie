import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser, subscribeToAuthChanges } from './lib/supabase'
import { useStore } from './store/useStore'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SwipePage from './pages/SwipePage'
import MatchesPage from './pages/MatchesPage'
import SettingsPage from './pages/SettingsPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const { setCurrentUser, fetchItems } = useStore()
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // Check for authenticated user on app load and subscribe to auth changes
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing session
        const user = await getCurrentUser()
        if (user) {
          setCurrentUser({
            id: user.id,
            name: user.name || 'User'
          })
          
          // Fetch furniture items
          await fetchItems()
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setIsAuthChecked(true)
      }
    }

    // Initialize app
    initializeApp()

    // Subscribe to auth state changes
    const { data: { subscription } } = subscribeToAuthChanges((user) => {
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name || 'User'
        })
        fetchItems()
      } else {
        setCurrentUser(null)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [setCurrentUser, fetchItems])

  // Show loading indicator while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your session...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="swipe" element={<SwipePage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
