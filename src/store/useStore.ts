import { create } from 'zustand'
import { getFurnitureItems, getUserLikes, addUserLike as addLike, removeUserLike as removeLike } from '../lib/supabase'
import { loadFurniture } from '../utils/loadFurniture'
import furnitureData from '../data/furniture.json'

export interface FurnitureItem {
  id: string
  imageUrl: string
  title: string
  description: string
  price: string
  category: string
}

interface User {
  id: string
  name: string
}

interface StoreState {
  // Users
  currentUser: User | null
  partner: User | null
  
  // Furniture items
  items: FurnitureItem[]
  isLoadingItems: boolean
  
  // Preferences
  userLikes: string[] // IDs of items the current user likes
  partnerLikes: string[] // IDs of items the partner likes
  isLoadingLikes: boolean
  
  // Matches (items both users like)
  matches: string[] // IDs of matched items
  
  // Actions
  setCurrentUser: (user: User | null) => void
  setPartner: (user: User | null) => void
  fetchItems: () => Promise<void>
  fetchUserLikes: (userId: string) => Promise<void>
  addUserLike: (itemId: string) => Promise<void>
  removeUserLike: (itemId: string) => Promise<void>
  addPartnerLike: (itemId: string) => void
  removePartnerLike: (itemId: string) => void
  resetLikes: () => void
}

// Mock data for furniture items (fallback if API fails)
const MOCK_FURNITURE: FurnitureItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    title: 'Modern Sofa',
    description: 'Comfortable and stylish sofa for your living room',
    price: '$899',
    category: 'sofa'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267',
    title: 'Wooden Dining Table',
    description: 'Elegant dining table for family gatherings',
    price: '$649',
    category: 'table'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25',
    title: 'Minimalist Bed Frame',
    description: 'Simple and modern bed frame for your bedroom',
    price: '$749',
    category: 'bed'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
    title: 'Accent Chair',
    description: 'Stylish accent chair for any room',
    price: '$349',
    category: 'chair'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72',
    title: 'Modern Kitchen Cabinet',
    description: 'Sleek kitchen cabinet with ample storage',
    price: '$1,299',
    category: 'kitchen'
  }
]

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  currentUser: null,
  partner: null,
  items: furnitureData,
  isLoadingItems: false,
  userLikes: [],
  partnerLikes: [],
  isLoadingLikes: false,
  matches: [],
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setPartner: (user) => set({ partner: user }),
  
  fetchItems: async () => {
    set({ isLoadingItems: true })
    try {
      const items = await loadFurniture()
      set({ items })
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      set({ isLoadingItems: false })
    }
  },
  
  fetchUserLikes: async (userId) => {
    set({ isLoadingLikes: true })
    try {
      const likes = await getUserLikes(userId)
      set({ userLikes: likes })
      
      // Update matches
      const { partnerLikes } = get()
      const matches = likes.filter(id => partnerLikes.includes(id))
      set({ matches })
    } catch (error) {
      console.error('Error fetching user likes:', error)
    } finally {
      set({ isLoadingLikes: false })
    }
  },
  
  addUserLike: async (itemId) => {
    const { currentUser, partnerLikes } = get()
    if (!currentUser) return
    
    try {
      await addLike(currentUser.id, itemId)
      
      // Update local state
      const newUserLikes = [...get().userLikes, itemId]
      const newMatches = partnerLikes.includes(itemId) 
        ? [...get().matches, itemId]
        : get().matches
      
      set({ 
        userLikes: newUserLikes,
        matches: newMatches
      })
    } catch (error) {
      console.error('Error adding user like:', error)
    }
  },
  
  removeUserLike: async (itemId) => {
    const { currentUser } = get()
    if (!currentUser) return
    
    try {
      await removeLike(currentUser.id, itemId)
      
      // Update local state
      set({
        userLikes: get().userLikes.filter(id => id !== itemId),
        matches: get().matches.filter(id => id !== itemId)
      })
    } catch (error) {
      console.error('Error removing user like:', error)
    }
  },
  
  addPartnerLike: (itemId) => set((state) => {
    const newPartnerLikes = [...state.partnerLikes, itemId]
    const newMatches = state.userLikes.includes(itemId)
      ? [...state.matches, itemId]
      : state.matches
    
    return {
      partnerLikes: newPartnerLikes,
      matches: newMatches
    }
  }),
  
  removePartnerLike: (itemId) => set((state) => ({
    partnerLikes: state.partnerLikes.filter(id => id !== itemId),
    matches: state.matches.filter(id => id !== itemId)
  })),
  
  resetLikes: () => set({ userLikes: [], partnerLikes: [], matches: [] })
})) 