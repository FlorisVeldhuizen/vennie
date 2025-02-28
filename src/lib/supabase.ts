import { createClient } from '@supabase/supabase-js'

// These would typically come from environment variables
// For demo purposes, we're using placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for authentication
export type AuthUser = {
  id: string
  email: string
  name?: string
}

// Helper functions for authentication
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata.name || user.email?.split('@')[0] || 'User'
  }
}

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password })
}

export const signUp = async (email: string, password: string, name: string) => {
  return supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: { name }
    }
  })
}

export const signOut = async () => {
  return supabase.auth.signOut()
}

export const resetPassword = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email)
} 