import { create } from 'zustand'

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
  
  // Preferences
  userLikes: string[] // IDs of items the current user likes
  partnerLikes: string[] // IDs of items the partner likes
  
  // Matches (items both users like)
  matches: string[] // IDs of matched items
  
  // Actions
  setCurrentUser: (user: User | null) => void
  setPartner: (user: User | null) => void
  setItems: (items: FurnitureItem[]) => void
  addUserLike: (itemId: string) => void
  addPartnerLike: (itemId: string) => void
  removeUserLike: (itemId: string) => void
  removePartnerLike: (itemId: string) => void
  resetLikes: () => void
}

// Mock data for furniture items
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

export const useStore = create<StoreState>((set) => ({
  // Initial state
  currentUser: { id: 'user1', name: 'User 1' },
  partner: { id: 'user2', name: 'User 2' },
  items: MOCK_FURNITURE,
  userLikes: [],
  partnerLikes: [],
  matches: [],
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setPartner: (user) => set({ partner: user }),
  setItems: (items) => set({ items }),
  
  addUserLike: (itemId) => set((state) => {
    const newUserLikes = [...state.userLikes, itemId]
    const newMatches = state.partnerLikes.includes(itemId) 
      ? [...state.matches, itemId]
      : state.matches
    
    return { 
      userLikes: newUserLikes,
      matches: newMatches
    }
  }),
  
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
  
  removeUserLike: (itemId) => set((state) => ({
    userLikes: state.userLikes.filter(id => id !== itemId),
    matches: state.matches.filter(id => id !== itemId)
  })),
  
  removePartnerLike: (itemId) => set((state) => ({
    partnerLikes: state.partnerLikes.filter(id => id !== itemId),
    matches: state.matches.filter(id => id !== itemId)
  })),
  
  resetLikes: () => set({ userLikes: [], partnerLikes: [], matches: [] })
})) 