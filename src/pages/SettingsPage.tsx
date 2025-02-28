import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useStore } from '../store/useStore'

const SettingsPage = () => {
  const { currentUser } = useStore()
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
    
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode activated`)
  }

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
          <button 
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} 
            />
          </button>
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