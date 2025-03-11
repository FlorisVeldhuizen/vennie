import { Page, ElementHandle } from 'puppeteer'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

// Types
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

interface ScrapedProductInfo {
  title: string
  price: number
  url: string
  imageUrl: string
  description?: string
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

// Configuration
const CONFIG = {
  browser: {
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  },
  scraping: {
    maxRetries: 3,
    itemsPerCategory: 10,
    maxItemsPerFile: 100,
    timeouts: {
      navigation: 5000,
      elementWait: 10000
    },
    delays: {
      afterNavigation: 2000,
      betweenCategories: 1000
    }
  },
  paths: {
    dataDir: path.join(process.cwd(), 'src', 'data'),
    catalogPrefix: 'furniture-catalog-'
  },
  currency: {
    code: 'EUR',
    symbol: '€',
    rate: 0.92 // USD to EUR conversion rate
  }
}

const CATEGORIES = [
  {
    url: 'https://www.ikea.com/us/en/cat/sofas-sectionals-fu003/',
    name: 'Living Room',
    pages: 5
  },
  {
    url: 'https://www.ikea.com/us/en/cat/beds-bm003/',
    name: 'Bedroom',
    pages: 4
  },
  {
    url: 'https://www.ikea.com/us/en/cat/dining-sets-25219/',
    name: 'Dining',
    pages: 3
  }
]

// Selectors for finding product elements
const PRODUCT_SELECTORS = [
  '.pip-product-compact',
  '[data-product-card]',
  '.product-compact',
  '.product-card',
  '.product',
  '.plp-fragment-wrapper',
  '.plp-product-list__products',
  '[data-ref-type="product"]'
]

/**
 * Extracts detailed product information
 */
async function extractProductInfo(page: Page, el: ElementHandle<Element>, index: number, categoryName: string): Promise<FurnitureItem | null> {
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
      let price = 0;
      const dataPrice = productEl.getAttribute('data-price');
      if (dataPrice) {
        price = parseFloat(dataPrice) || 0;
      } else {
        const priceEl = productEl.querySelector('.pip-price__integer, span[class*="price"], [data-price]');
        if (priceEl) {
          const rawPrice = priceEl.textContent?.replace(/[^0-9.]/g, '') || '0';
          price = parseFloat(rawPrice) || 0;
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

      // Extract additional details
      const details: Record<string, string> = {};
      
      // Try to find materials
      const materialsEl = productEl.querySelector('[data-material], [class*="material"]');
      if (materialsEl) {
        details.materials = materialsEl.textContent?.trim() || '';
      }
      
      // Try to find dimensions
      const dimensionsEl = productEl.querySelector('[data-dimensions], [class*="dimension"]');
      if (dimensionsEl) {
        details.dimensions = dimensionsEl.textContent?.trim() || '';
      }
      
      // Try to find color
      const colorEl = productEl.querySelector('[data-color], [class*="color"]');
      if (colorEl) {
        details.color = colorEl.textContent?.trim() || '';
      }

      // Get description elements
      const descriptionEls = productEl.querySelectorAll('[class*="description"], [class*="detail"], [data-description]');
      const descriptions = Array.from(descriptionEls).map(el => el.textContent?.trim()).filter(Boolean);

      return { 
        title, 
        price, 
        url, 
        imageUrl, 
        details,
        description: descriptions.join(' ') || title // Use concatenated descriptions or fallback to title
      };
    }, el);

    if (productInfo.title && productInfo.url) {
      // Convert price to EUR
      const priceInEur = productInfo.price * CONFIG.currency.rate;
      
      const item: FurnitureItem = {
        id: `ikea-${index}`,
        title: productInfo.title,
        description: generateDescription(productInfo),
        price: {
          amount: Number(priceInEur.toFixed(2)),
          currency: CONFIG.currency.code
        },
        category: categoryName,
        imageUrl: productInfo.imageUrl || productInfo.url,
        url: productInfo.url,
        details: productInfo.details
      };
      console.log(`[${categoryName}] Successfully extracted product ${index + 1} data:`, item);
      return item;
    }
    return null;
  } catch (error) {
    console.error(`[${categoryName}] Error processing product ${index + 1}:`, error);
    return null;
  }
}

/**
 * Generates a rich description from product information
 */
function generateDescription(productInfo: ScrapedProductInfo): string {
  const parts: string[] = [];
  
  // Start with the title
  parts.push(productInfo.title);
  
  // Add any existing description
  if (productInfo.description && productInfo.description !== productInfo.title) {
    parts.push(productInfo.description);
  }
  
  // Add details if available
  if (productInfo.details) {
    if (productInfo.details.color) {
      parts.push(`Available in ${productInfo.details.color}.`);
    }
    if (productInfo.details.materials) {
      parts.push(`Made from ${productInfo.details.materials}.`);
    }
    if (productInfo.details.dimensions) {
      parts.push(`Dimensions: ${productInfo.details.dimensions}.`);
    }
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Gets the URL for a specific page of a category
 */
function getCategoryPageUrl(baseUrl: string, page: number): string {
  const url = new URL(baseUrl);
  if (page > 1) {
    url.searchParams.set('page', page.toString());
  }
  return url.toString();
}

/**
 * Finds the next available catalog file number
 */
async function getNextCatalogNumber(): Promise<number> {
  const files = await fs.readdir(CONFIG.paths.dataDir);
  const catalogFiles = files.filter(f => f.startsWith(CONFIG.paths.catalogPrefix));
  
  if (catalogFiles.length === 0) return 1;
  
  // Check the last catalog file
  const lastFile = catalogFiles[catalogFiles.length - 1];
  const lastCatalogPath = path.join(CONFIG.paths.dataDir, lastFile);
  const catalogContent = await fs.readFile(lastCatalogPath, 'utf-8');
  const catalog = JSON.parse(catalogContent);
  
  // If the last catalog isn't complete, return its number
  if (!catalog.meta.isComplete) {
    return parseInt(lastFile.replace(CONFIG.paths.catalogPrefix, '').replace('.json', ''));
  }
  
  // Otherwise, start a new catalog
  return catalogFiles.length + 1;
}

/**
 * Loads existing items from a catalog file
 */
async function loadExistingCatalog(catalogNumber: number): Promise<{ items: FurnitureItem[], meta: CatalogMeta }> {
  const catalogPath = path.join(CONFIG.paths.dataDir, `${CONFIG.paths.catalogPrefix}${catalogNumber}.json`);
  
  try {
    const content = await fs.readFile(catalogPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      items: [],
      meta: {
        lastUpdate: new Date().toISOString(),
        totalItems: 0,
        isComplete: false
      }
    };
  }
}

/**
 * Saves items to a catalog file
 */
async function saveCatalog(catalogNumber: number, items: FurnitureItem[], isComplete: boolean) {
  const catalogPath = path.join(CONFIG.paths.dataDir, `${CONFIG.paths.catalogPrefix}${catalogNumber}.json`);
  
  const catalog = {
    items,
    meta: {
      lastUpdate: new Date().toISOString(),
      totalItems: items.length,
      isComplete
    }
  };
  
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));
}

/**
 * Scrapes products from a single category page
 */
async function scrapeCategory(
  page: Page,
  categoryName: string,
  categoryUrl: string,
  itemsPerCategory: number
): Promise<FurnitureItem[]> {
  let retries = 0;

  while (retries < CONFIG.scraping.maxRetries) {
    try {
      console.log(`[${categoryName}] Navigating to page...`);
      
      // Set up page
      await page.setUserAgent(CONFIG.browser.userAgent);
      
      // Navigate to category page
      await page.goto(categoryUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.scraping.timeouts.navigation
      });
      console.log(`[${categoryName}] Initial load complete`);

      // Debug info
      const currentUrl = await page.url();
      const pageTitle = await page.title();
      console.log(`[${categoryName}] Current URL: ${currentUrl}`);
      console.log(`[${categoryName}] Page title: "${pageTitle}"`);

      // Check for redirection
      if (currentUrl.includes('/products-products/')) {
        throw new Error('Redirected to general products page');
      }

      // Wait for content and add delay
      console.log(`[${categoryName}] Waiting for main content...`);
      await page.waitForSelector('.plp-fragment-wrapper, .product-listing-page, [data-ref-type="product"]', {
        timeout: CONFIG.scraping.timeouts.elementWait
      });
      await new Promise(resolve => setTimeout(resolve, CONFIG.scraping.delays.afterNavigation));

      // Find available product selectors
      console.log(`[${categoryName}] Checking available product selectors...`);
      const availableSelectors = await page.evaluate((selectors) => {
        return selectors.map(selector => ({
          selector,
          count: document.querySelectorAll(selector).length,
          sample: document.querySelector(selector)?.innerHTML.slice(0, 100) || 'No sample available'
        }));
      }, PRODUCT_SELECTORS);
      
      // Log available selectors
      console.log(`[${categoryName}] Available selectors with samples:`);
      availableSelectors.forEach(({ selector, count, sample }) => {
        if (count > 0) {
          console.log(`  ${selector}: ${count} elements found`);
          console.log(`  Sample: ${sample}\n`);
        }
      });
      
      // Find working selector
      const workingSelector = availableSelectors.find(s => s.count > 0);
      if (!workingSelector) {
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log(`[${categoryName}] No product elements found. Page preview:`, bodyText.slice(0, 500));
        throw new Error('No product selectors found on the page');
      }

      console.log(`[${categoryName}] Using selector: ${workingSelector.selector} (${workingSelector.count} elements)`);
      
      // Wait for products and get elements
      await page.waitForSelector(workingSelector.selector, { timeout: CONFIG.scraping.timeouts.elementWait });
      console.log(`[${categoryName}] Waiting for dynamic content...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.scraping.delays.afterNavigation));

      const products = await page.$$(workingSelector.selector);
      console.log(`[${categoryName}] Found ${products.length} products`);
      
      // Process products
      const items = await Promise.all(
        products.slice(0, itemsPerCategory).map((el, index) => 
          extractProductInfo(page, el, index, categoryName)
        )
      );

      const validItems = items.filter((item): item is FurnitureItem => item !== null);
      console.log(`[${categoryName}] Successfully scraped ${validItems.length} items`);
      return validItems;

    } catch (error) {
      retries++;
      console.error(`Error scraping ${categoryName} (attempt ${retries}/${CONFIG.scraping.maxRetries}):`, error);
      
      if (error.name === 'TimeoutError') {
        const title = await page.title();
        const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'No H1 found');
        console.log(`[${categoryName}] Page info - Title: "${title}", H1: "${h1Text}"`);
        console.log(`[${categoryName}] Current URL:`, await page.url());
      }
      
      if (retries === CONFIG.scraping.maxRetries) {
        console.error(`Failed to scrape ${categoryName} after ${CONFIG.scraping.maxRetries} attempts`);
        return [];
      }
      
      await new Promise(resolve => setTimeout(resolve, CONFIG.scraping.delays.afterNavigation));
    }
  }

  return [];
}

/**
 * Sets up the browser and scrapes all categories
 */
async function scrapeFurniture(): Promise<FurnitureItem[]> {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.browser.viewport);
  
  // Block unnecessary resources
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'font', 'media'].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  const items: FurnitureItem[] = [];

  try {
    for (const category of CATEGORIES) {
      console.log(`Scraping ${category.name} furniture...`);
      
      // Get a random page number
      const pageNumber = Math.floor(Math.random() * category.pages) + 1;
      const categoryUrl = getCategoryPageUrl(category.url, pageNumber);
      console.log(`[${category.name}] Using page ${pageNumber}`);
      
      const categoryItems = await scrapeCategory(
        page, 
        category.name, 
        categoryUrl, 
        CONFIG.scraping.itemsPerCategory
      );
      items.push(...categoryItems);
      
      await new Promise(resolve => setTimeout(resolve, CONFIG.scraping.delays.betweenCategories));
    }
  } finally {
    await browser.close();
  }

  return items;
}

/**
 * Main function that runs the scraper and saves results
 */
async function main() {
  console.log('Starting furniture catalog builder...');
  
  try {
    // Ensure data directory exists
    await fs.mkdir(CONFIG.paths.dataDir, { recursive: true });
    
    // Get the next catalog number
    const catalogNumber = await getNextCatalogNumber();
    console.log(`Using catalog #${catalogNumber}`);
    
    // Load existing items
    const { items: existingItems } = await loadExistingCatalog(catalogNumber);
    console.log(`Found ${existingItems.length} existing items in catalog`);
    
    // Scrape new items
    const newItems = await scrapeFurniture();
    console.log(`Scraped ${newItems.length} new items`);
    
    // Combine items and deduplicate by URL
    const allItems = [...existingItems, ...newItems];
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(i => i.url === item.url)
    );
    
    // Check if we've reached the maximum items
    const isComplete = uniqueItems.length >= CONFIG.scraping.maxItemsPerFile;
    const itemsToSave = isComplete 
      ? uniqueItems.slice(0, CONFIG.scraping.maxItemsPerFile)
      : uniqueItems;
    
    // Save to catalog file
    await saveCatalog(catalogNumber, itemsToSave, isComplete);
    
    // Log summary
    console.log('\nCatalog update summary:');
    console.log(`- Catalog #${catalogNumber}`);
    console.log(`- Total items: ${itemsToSave.length}`);
    console.log(`- Status: ${isComplete ? 'Complete' : 'In Progress'}`);
    
    const itemsByCategory = itemsToSave.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(itemsByCategory).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} items`);
    });
    
  } catch (error) {
    console.error('Failed to build furniture catalog:', error);
    process.exit(1);
  }
}

main();