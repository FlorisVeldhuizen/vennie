import { Outlet, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { signOut } from '../lib/supabase'

const Layout = () => {
  const { currentUser, setCurrentUser } = useStore()

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-app py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600">Vennie</Link>
          <nav>
            <ul className="flex gap-4">
              <li><Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link></li>
              {currentUser ? (
                <>
                  <li><Link to="/swipe" className="text-gray-600 hover:text-primary-600">Swipe</Link></li>
                  <li><Link to="/matches" className="text-gray-600 hover:text-primary-600">Matches</Link></li>
                  <li><Link to="/settings" className="text-gray-600 hover:text-primary-600">Settings</Link></li>
                  <li>
                    <button 
                      onClick={handleSignOut}
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
        <Outlet />
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="container-app py-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Vennie - Find furniture you both love</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout 