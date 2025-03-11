import { Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

interface FurnitureItem {
  id: string
  title: string
  description: string
  price: string
  category: string
  imageUrl: string
}

const CATEGORIES = [
  {
    url: 'https://www.ikea.com/us/en/cat/sofas-sectionals-fu003/',
    name: 'Living Room'
  },
  {
    url: 'https://www.ikea.com/us/en/cat/beds-bm003/',
    name: 'Bedroom'
  },
  {
    url: 'https://www.ikea.com/us/en/cat/dining-sets-25219/',
    name: 'Dining'
  }
]

const MAX_RETRIES = 3
const ITEMS_PER_CATEGORY = 7

async function scrapeCategory(
  page: Page,
  categoryName: string,
  categoryUrl: string,
  ITEMS_PER_CATEGORY: number
): Promise<FurnitureItem[]> {
  const items: FurnitureItem[] = []
  let retries = 0

  while (retries < MAX_RETRIES) {
    try {
      console.log(`[${categoryName}] Navigating to page...`)
      try {
        // Set a user agent to look more like a real browser
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')
        
        // First navigate with just domcontentloaded
        await page.goto(categoryUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        })
        console.log(`[${categoryName}] Initial page load complete`)

        // Log the current URL and page title for debugging
        const currentUrl = await page.url()
        const pageTitle = await page.title()
        console.log(`[${categoryName}] Current URL: ${currentUrl}`)
        console.log(`[${categoryName}] Page title: "${pageTitle}"`)

        // Check for redirection
        if (currentUrl.includes('/products-products/')) {
          throw new Error('Redirected to general products page')
        }

        // Wait for the main content area
        console.log(`[${categoryName}] Waiting for main content...`)
        await page.waitForSelector('.plp-fragment-wrapper, .product-listing-page, [data-ref-type="product"]', {
          timeout: 1000
        })

        // Add a delay after navigation
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Try to find what product-related elements are available
        const debugSelectors = [
          '.pip-product-compact',
          '[data-product-card]',
          '.product-compact',
          '.product-card',
          '.product',
          '.plp-fragment-wrapper',
          '.plp-product-list__products',
          '[data-ref-type="product"]'
        ]
        
        console.log(`[${categoryName}] Checking available product selectors...`)
        const availableSelectors = await page.evaluate((selectors) => {
          return selectors.map(selector => ({
            selector,
            count: document.querySelectorAll(selector).length,
            sample: document.querySelector(selector)?.innerHTML.slice(0, 100) || 'No sample available'
          }))
        }, debugSelectors)
        
        console.log(`[${categoryName}] Available selectors with samples:`)
        availableSelectors.forEach(({ selector, count, sample }) => {
          if (count > 0) {
            console.log(`  ${selector}: ${count} elements found`)
            console.log(`  Sample: ${sample}\n`)
          }
        })
        
        // Find the first selector that has elements
        const workingSelector = availableSelectors.find(s => s.count > 0)
        if (!workingSelector) {
          // If no products found, log the page content for debugging
          const bodyText = await page.evaluate(() => document.body.innerText)
          console.log(`[${categoryName}] No product elements found. Page preview:`, bodyText.slice(0, 500))
          throw new Error('No product selectors found on the page')
        }

        console.log(`[${categoryName}] Using selector: ${workingSelector.selector} (${workingSelector.count} elements)`)
        
        // Wait for the selected elements to be properly loaded
        await page.waitForSelector(workingSelector.selector, { timeout: 10000 })
        
        // Additional wait for dynamic content
        console.log(`[${categoryName}] Waiting for dynamic content...`)
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Get all products
        const products = await page.$$(workingSelector.selector)
        console.log(`[${categoryName}] Found ${products.length} products`)
        
        const items = await Promise.all(
          products.slice(0, ITEMS_PER_CATEGORY).map(async (el, index) => {
            console.log(`[${categoryName}] Processing product ${index + 1}/${ITEMS_PER_CATEGORY}`);
            
            try {
              // Get element HTML for debugging
              const html = await page.evaluate(el => el.outerHTML, el);
              console.log(`[${categoryName}] Product ${index + 1} HTML structure:`, html.slice(0, 200) + '...');

              // Extract product info
              const productInfo = await page.evaluate((el) => {
                // Get the actual product element (might be nested)
                const productEl = el.querySelector('[data-product-name]') || el;

                // Get title from data-product-name or aria-label
                let title = productEl.getAttribute('data-product-name') || '';
                if (!title) {
                  const link = productEl.querySelector('a');
                  if (link) {
                    title = link.getAttribute('aria-label') || '';
                  }
                }

                // Get price from data-price or price element
                let price = '0.00';
                const dataPrice = productEl.getAttribute('data-price');
                if (dataPrice) {
                  price = (parseFloat(dataPrice) || 0).toFixed(2);
                } else {
                  const priceEl = productEl.querySelector('.pip-price__integer, span[class*="price"], [data-price]');
                  if (priceEl) {
                    const rawPrice = priceEl.textContent?.replace(/[^0-9.]/g, '') || '0';
                    price = (parseFloat(rawPrice) || 0).toFixed(2);
                  }
                }

                // Get URL and image
                let url = '';
                let imageUrl = '';
                const link = productEl.querySelector('a') as HTMLAnchorElement | null;
                if (link) {
                  url = link.href;
                  const img = link.querySelector('img');
                  if (img) {
                    imageUrl = img.src;
                  }
                } else if (productEl.tagName === 'A') {
                  const anchor = productEl as HTMLAnchorElement;
                  url = anchor.href;
                  const img = anchor.querySelector('img');
                  if (img) {
                    imageUrl = img.src;
                  }
                } else {
                  const refId = productEl.getAttribute('data-ref-id');
                  if (refId) {
                    url = `https://www.ikea.com/us/en/p/${refId}/`;
                    const img = productEl.querySelector('img');
                    if (img) {
                      imageUrl = img.src;
                    }
                  }
                }

                return { title, price, url, imageUrl };
              }, el);

              if (productInfo.title && productInfo.url) {
                const item: FurnitureItem = {
                  id: `ikea-${index}`,
                  title: productInfo.title,
                  description: productInfo.title,
                  price: `$${productInfo.price}`,
                  category: categoryName,
                  imageUrl: productInfo.imageUrl || productInfo.url
                };
                console.log(`[${categoryName}] Successfully extracted product ${index + 1} data:`, item);
                return item;
              }
              return null;
            } catch (error) {
              console.error(`[${categoryName}] Error processing product ${index + 1}:`, error);
              return null;
            }
          })
        );

        const validItems = items.filter((item): item is FurnitureItem => item !== null);

        console.log(`[${categoryName}] Successfully scraped ${validItems.length} items`);
        return validItems;
      } catch (error) {
        console.log(`[${categoryName}] Error while waiting for products:`, error)
        if (error.name === 'TimeoutError') {
          // Instead of full HTML, let's check what elements we can find
          const title = await page.title()
          const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'No H1 found')
          console.log(`[${categoryName}] Page info - Title: "${title}", H1: "${h1Text}"`)
          console.log(`[${categoryName}] Checking if we're blocked or redirected...`)
          console.log(`[${categoryName}] Current URL:`, await page.url())
          throw error
        }
        throw error
      }
    } catch (error) {
      retries++
      console.error(`Error scraping ${categoryName} (attempt ${retries}/${MAX_RETRIES}):`, error)
      
      if (retries === MAX_RETRIES) {
        console.error(`Failed to scrape ${categoryName} after ${MAX_RETRIES} attempts`)
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait before retry
      }
    }
  }

  return items
}

async function scrapeFurniture(): Promise<FurnitureItem[]> {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  
  // Add request interception to block unnecessary resources
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    if (
      request.resourceType() === 'image' ||
      request.resourceType() === 'font' ||
      request.resourceType() === 'media'
    ) {
      request.abort()
    } else {
      request.continue()
    }
  })

  const items: FurnitureItem[] = []

  try {
    for (const category of CATEGORIES) {
      console.log(`Scraping ${category.name} furniture...`)
      const categoryItems = await scrapeCategory(page, category.name, category.url, ITEMS_PER_CATEGORY)
      items.push(...categoryItems)
      
      // Small delay between categories
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } finally {
    await browser.close()
  }

  return items
}

async function main() {
  console.log('Starting furniture scraper...')
  console.log(`Will scrape ${CATEGORIES.length} categories, ${ITEMS_PER_CATEGORY} items each`)
  
  try {
    const items = await scrapeFurniture()
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data')
    await fs.mkdir(dataDir, { recursive: true })
    
    // Write the results to a JSON file
    const outputPath = path.join(dataDir, 'furniture.json')
    await fs.writeFile(outputPath, JSON.stringify(items, null, 2))
    
    console.log(`Successfully scraped ${items.length} items:`)
    const itemsByCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(itemsByCategory).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} items`)
    })
    
    console.log(`\nData saved to ${outputPath}`)
  } catch (error) {
    console.error('Failed to scrape furniture:', error)
    process.exit(1)
  }
}

main()