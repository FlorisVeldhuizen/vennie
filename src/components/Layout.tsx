import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { signOut } from '../lib/supabase'
import { useState } from 'react'

const Layout = () => {
  const { currentUser, setCurrentUser } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    // The auth state will be handled by the subscription in App.tsx
    // but we'll also update the local state for immediate UI feedback
    setCurrentUser(null)
    navigate('/')
  }
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 transition-all duration-300">
            <span className="flex items-center">
              <span className="mr-2">🪑</span>
              Vennie
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600 hover:text-primary-600 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex gap-6 items-center">
              {currentUser ? (
                <>
                  <li>
                    <Link 
                      to="/swipe" 
                      className={`font-medium transition-all duration-300 ${
                        isActive('/swipe') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      Swipe
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/matches" 
                      className={`font-medium transition-all duration-300 ${
                        isActive('/matches') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      Matches
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings" 
                      className={`font-medium transition-all duration-300 ${
                        isActive('/settings') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleSignOut}
                      className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full font-medium hover:shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className={`font-medium transition-all duration-300 ${
                        isActive('/login') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="ml-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
            <ul className="py-2 px-4 space-y-3">
              {currentUser ? (
                <>
                  <li>
                    <Link 
                      to="/swipe" 
                      className={`block py-2 font-medium ${
                        isActive('/swipe') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Swipe
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/matches" 
                      className={`block py-2 font-medium ${
                        isActive('/matches') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Matches
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings" 
                      className={`block py-2 font-medium ${
                        isActive('/settings') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 font-medium text-gray-600 dark:text-gray-300"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className={`block py-2 font-medium ${
                        isActive('/login') 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="block py-2 font-medium text-primary-600 dark:text-primary-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout 