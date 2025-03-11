import { create } from 'zustand'
import { loadFurniture, type CurrencyCode } from '../utils/loadFurniture'
import type { AuthUser } from '../lib/supabase'

export interface FurnitureItem {
  id: string
  title: string
  description: string
  price: {
    amount: number
    currency: string
  }
  category: string
  imageUrl: string
  url: string
  details: {
    materials?: string
    dimensions?: string
    color?: string
  }
}

interface Store {
  items: FurnitureItem[]
  isLoadingItems: boolean
  currentUser: AuthUser | null
  setCurrentUser: (user: AuthUser | null) => void
  fetchItems: (currency: CurrencyCode) => Promise<void>
  addUserLike: (itemId: string) => void
}

export const useStore = create<Store>((set, get) => ({
  items: [],
  isLoadingItems: false,
  currentUser: null,
  
  setCurrentUser: (user: AuthUser | null) => {
    set({ currentUser: user })
  },
  
  fetchItems: async (currency: CurrencyCode) => {
    set({ isLoadingItems: true })
    try {
      const items = await loadFurniture(currency)
      set({ items })
    } catch (error) {
      console.error('Failed to load furniture:', error)
    } finally {
      set({ isLoadingItems: false })
    }
  },
  
  addUserLike: (itemId: string) => {
    const currentUser = get().currentUser
    if (!currentUser) return
    
    set({
      currentUser: {
        ...currentUser,
        likes: [...(currentUser.likes || []), itemId]
      }
    })
  }
})) 