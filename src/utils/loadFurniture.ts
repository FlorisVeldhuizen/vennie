import type { Item } from '../types'

// Fallback data in case the scraped data is not available
const fallbackItems: Item[] = [
  {
    id: '1',
    title: 'Modern Sofa',
    description: 'A comfortable modern sofa for your living room',
    price: '$899',
    category: 'Sofas',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc'
  },
  {
    id: '2',
    title: 'Wooden Dining Table',
    description: 'Elegant dining table for family gatherings',
    price: '$649',
    category: 'Tables',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267'
  },
  {
    id: '3',
    title: 'Minimalist Bed Frame',
    description: 'Simple and modern bed frame for your bedroom',
    price: '$749',
    category: 'Beds',
    imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25'
  }
]

export async function loadFurniture(): Promise<Item[]> {
  try {
    const response = await fetch('/src/data/furniture.json')
    if (!response.ok) {
      throw new Error('Failed to load furniture data')
    }
    
    const items: Item[] = await response.json()
    return items.length > 0 ? items : fallbackItems
  } catch (error) {
    console.warn('Using fallback furniture data:', error)
    return fallbackItems
  }
} 