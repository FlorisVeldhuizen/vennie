import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import SwipePage from './pages/SwipePage'
import MatchesPage from './pages/MatchesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'

// Home component
const Home = () => {
  const { user, logout } = useAuth()
  
  return (
    <div className="container-app py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-primary-600 mb-4">Vennie</h1>
        <p className="text-xl mb-8">Find furniture you both love</p>
        
        {user ? (
          <div className="space-y-6">
            <p className="text-lg">Welcome, {user.name || user.email}!</p>
            
            <div className="flex justify-center gap-4">
              <Link to="/swipe" className="btn btn-primary">Start Swiping</Link>
              <Link to="/matches" className="btn btn-secondary">View Matches</Link>
            </div>
            
            <div>
              <button 
                onClick={logout}
                className="text-gray-600 hover:text-primary-600 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function App() {
  const { user, logout } = useAuth()
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container-app py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">Vennie</Link>
            <nav>
              <ul className="flex gap-4">
                <li><Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link></li>
                {user ? (
                  <>
                    <li><Link to="/swipe" className="text-gray-600 hover:text-primary-600">Swipe</Link></li>
                    <li><Link to="/matches" className="text-gray-600 hover:text-primary-600">Matches</Link></li>
                    <li>
                      <button 
                        onClick={logout}
                        className="text-gray-600 hover:text-primary-600"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="text-gray-600 hover:text-primary-600">Sign In</Link></li>
                    <li><Link to="/register" className="text-gray-600 hover:text-primary-600">Register</Link></li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/swipe" element={<SwipePage />} />
              <Route path="/matches" element={<MatchesPage />} />
            </Route>
          </Routes>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 shadow-inner">
          <div className="container-app py-4 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Vennie - Find furniture you both love</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
