import { createClient } from '@supabase/supabase-js'
import { FurnitureItem } from '../store/useStore'

// Database types
interface DbFurnitureItem {
  id: string
  title: string
  description: string | null
  price: string | null
  currency: string | null
  image_url: string
  category: string | null
  url: string | null
  materials: string | null
  dimensions: string | null
  color: string | null
  created_at: string
}

interface DbUserLike {
  user_id: string
  item_id: string
  created_at: string
}

// These would typically come from environment variables
// For demo purposes, we're using placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Create or get Supabase client with persistence enabled
export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'vennie-auth-storage-key',
        autoRefreshToken: true,
      }
    })
  }
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabase()

// Types for authentication
export type AuthUser = {
  id: string
  email: string
  name?: string
  likes?: string[]
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

// Helper function to subscribe to auth state changes
export const subscribeToAuthChanges = (
  callback: (user: AuthUser | null) => void
) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User'
        }
        callback(user)
      }
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}

// Furniture items functions
export const getFurnitureItems = async (): Promise<FurnitureItem[]> => {
  const { data, error } = await supabase
    .from('furniture_items')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching furniture items:', error)
    return []
  }
  
  const rawData = data as unknown as DbFurnitureItem[]
  return rawData.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    price: {
      amount: parseFloat(item.price || '0'),
      currency: item.currency || 'EUR'
    },
    imageUrl: item.image_url,
    category: item.category || '',
    url: item.url || '',
    details: {
      materials: item.materials || undefined,
      dimensions: item.dimensions || undefined,
      color: item.color || undefined
    }
  }))
}

// User likes functions
export const getUserLikes = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_likes')
    .select('item_id')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user likes:', error)
    return []
  }
  
  return (data as DbUserLike[]).map(like => like.item_id)
}

export const addUserLike = async (userId: string, itemId: string) => {
  return supabase
    .from('user_likes')
    .insert({ user_id: userId, item_id: itemId })
}

export const removeUserLike = async (userId: string, itemId: string) => {
  return supabase
    .from('user_likes')
    .delete()
    .match({ user_id: userId, item_id: itemId })
}

// Get matches (items that both users like)
export const getMatches = async (userId: string, partnerId: string): Promise<string[]> => {
  // Get user likes
  const { data: userLikes, error: userError } = await supabase
    .from('user_likes')
    .select('item_id')
    .eq('user_id', userId)
  
  if (userError) {
    console.error('Error fetching user likes:', userError)
    return []
  }
  
  // Get partner likes
  const { data: partnerLikes, error: partnerError } = await supabase
    .from('user_likes')
    .select('item_id')
    .eq('user_id', partnerId)
  
  if (partnerError) {
    console.error('Error fetching partner likes:', partnerError)
    return []
  }
  
  // Find matches (items that both users like)
  const userLikeIds = (userLikes as Pick<DbUserLike, 'item_id'>[]).map(like => like.item_id)
  const partnerLikeIds = (partnerLikes as Pick<DbUserLike, 'item_id'>[]).map(like => like.item_id)
  
  return userLikeIds.filter(id => partnerLikeIds.includes(id))
} 