interface FurnitureItem {
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

interface CatalogMeta {
  lastUpdate: string
  totalItems: number
  isComplete: boolean
}

interface Catalog {
  items: FurnitureItem[]
  meta: CatalogMeta
}

type CurrencyCode = 'EUR' | 'USD' | 'GBP'

const CURRENCY_CONFIG = {
  EUR: { symbol: '€', rate: 1 },
  USD: { symbol: '$', rate: 1.09 }, // EUR to USD
  GBP: { symbol: '£', rate: 0.85 }  // EUR to GBP
}

const CONFIG = {
  catalogPrefix: 'furniture-catalog-',
  minItemsBeforeRotation: 20, // When to switch to a new catalog
  defaultCurrency: 'EUR' as CurrencyCode
}

/**
 * Format price with proper currency symbol and decimals
 */
function formatPrice(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency]
  const converted = amount * config.rate
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(converted)
}

/**
 * Convert items to requested currency
 */
function convertCurrency(items: FurnitureItem[], targetCurrency: CurrencyCode): FurnitureItem[] {
  if (targetCurrency === CONFIG.defaultCurrency) return items
  
  return items.map(item => ({
    ...item,
    price: {
      amount: Number((item.price.amount * CURRENCY_CONFIG[targetCurrency].rate).toFixed(2)),
      currency: targetCurrency
    }
  }))
}

/**
 * Loads all available catalog files
 */
async function loadCatalogs(): Promise<Catalog[]> {
  try {
    const catalogs: Catalog[] = []
    let catalogNumber = 1
    
    while (true) {
      try {
        const response = await fetch(`/src/data/${CONFIG.catalogPrefix}${catalogNumber}.json`)
        if (!response.ok) break
        
        const catalog = await response.json()
        catalogs.push(catalog)
        catalogNumber++
      } catch {
        break
      }
    }
    
    return catalogs
  } catch (error) {
    console.error('Error loading catalogs:', error)
    return []
  }
}

/**
 * Gets the best catalog to use based on available items
 */
async function selectCatalog(): Promise<Catalog | null> {
  const catalogs = await loadCatalogs()
  if (catalogs.length === 0) return null
  
  // First try to find a catalog with enough items that hasn't been completed
  const activeCatalog = catalogs.find(c => 
    !c.meta.isComplete && c.items.length >= CONFIG.minItemsBeforeRotation
  )
  if (activeCatalog) return activeCatalog
  
  // Then try to find any incomplete catalog
  const incompleteCatalog = catalogs.find(c => !c.meta.isComplete)
  if (incompleteCatalog) return incompleteCatalog
  
  // Finally, pick a random catalog to ensure variety
  const randomIndex = Math.floor(Math.random() * catalogs.length)
  return catalogs[randomIndex]
}

/**
 * Loads furniture items, managing multiple catalog files
 */
export async function loadFurniture(currency: CurrencyCode = CONFIG.defaultCurrency): Promise<FurnitureItem[]> {
  try {
    const catalog = await selectCatalog()
    if (!catalog) {
      console.warn('No furniture catalogs found')
      return []
    }
    
    // If we're running low on items in all catalogs,
    // we could notify the server to trigger a new scrape
    const catalogs = await loadCatalogs()
    const totalAvailableItems = catalogs.reduce((sum, c) => 
      sum + (c.meta.isComplete ? 0 : c.items.length), 
      0
    )
    
    if (totalAvailableItems < CONFIG.minItemsBeforeRotation) {
      console.log('Running low on furniture items')
      // We could call an API endpoint here to trigger a scrape:
      // await fetch('/api/trigger-scrape', { method: 'POST' })
    }
    
    // Convert prices to requested currency
    return convertCurrency(catalog.items, currency)
  } catch (error) {
    console.error('Error loading furniture:', error)
    return []
  }
}

// Export types and utilities for use in other files
export type { FurnitureItem, CurrencyCode }
export { formatPrice, CURRENCY_CONFIG } 