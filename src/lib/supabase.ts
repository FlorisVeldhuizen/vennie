import { createClient } from '@supabase/supabase-js'
import { FurnitureItem } from '../store/useStore'

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
  
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    price: item.price || '',
    imageUrl: item.image_url,
    category: item.category || ''
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
  
  return data.map(like => like.item_id)
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
  const userLikeIds = userLikes.map(like => like.item_id)
  const partnerLikeIds = partnerLikes.map(like => like.item_id)
  
  return userLikeIds.filter(id => partnerLikeIds.includes(id))
} 