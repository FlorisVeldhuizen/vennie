import { toast } from 'react-hot-toast'
import { useStore } from '../store/useStore'
import DarkModeToggle from '../components/DarkModeToggle'

const SettingsPage = () => {
  const { currentUser } = useStore()

  const resetPreferences = () => {
    // In a real app, this would clear user preferences from the database
    toast.success('Preferences reset successfully')
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      {currentUser && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              Signed in as: <span className="font-medium">{currentUser.name}</span>
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <DarkModeToggle />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <button 
          onClick={resetPreferences}
          className="btn btn-secondary"
        >
          Reset Preferences
        </button>
      </div>
    </div>
  )
}

export default SettingsPage 