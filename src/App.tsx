import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser } from './lib/supabase'
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

  // Check for authenticated user on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setCurrentUser({
            id: user.id,
            name: user.name || 'User'
          })
          
          // Fetch furniture items
          fetchItems()
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      }
    }

    initializeApp()
  }, [setCurrentUser, fetchItems])

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
