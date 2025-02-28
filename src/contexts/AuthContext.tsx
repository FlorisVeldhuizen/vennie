import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, getCurrentUser, signIn, signOut, signUp } from '../lib/supabase'
import { useStore } from '../store/useStore'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const setCurrentUser = useStore(state => state.setCurrentUser)
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser()
        setUser(user)
        
        // Update the store with the current user
        if (user) {
          setCurrentUser({ id: user.id, name: user.name || user.email })
        } else {
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [setCurrentUser])
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await signIn(email, password)
      
      if (error) {
        throw new Error(error.message)
      }
      
      const user = await getCurrentUser()
      setUser(user)
      
      if (user) {
        setCurrentUser({ id: user.id, name: user.name || user.email })
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }
  
  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await signUp(email, password, name)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // After signup, automatically log in
      await login(email, password)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Failed to register')
      setLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      setLoading(true)
      await signOut()
      setUser(null)
      setCurrentUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 