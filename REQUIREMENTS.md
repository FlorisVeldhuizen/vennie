# Vennie - Furniture Matching App Requirements

## Overview
Vennie is a single-page React application designed to help couples with different tastes find furniture they both like. The app presents users with images of various furniture items that they can swipe left or right based on their preferences. When both users like the same item, it's considered a match and saved for future reference.

## Core Features

### 1. User Experience
- Single-page React application
- Mobile-first design (responsive for desktop use as well)
- Simple, intuitive interface with swiping mechanics
- User accounts for couples to link their preferences

### 2. Furniture Browsing
- Swipe interface (left for dislike, right for like)
- High-quality images of furniture items
- Categorization by furniture type (tables, chairs, beds, kitchens, etc.)
- Filtering options for style, price range, color, etc.

### 3. Matching System
- Algorithm to identify when both users like the same item
- Match notification system
- Storage of matched items for later review
- Ability to rank or prioritize matches

### 4. Results & Decision Making
- Gallery view of all matched items
- Detailed information about each matched item
- Comparison tools to help make final decisions
- Option to save favorites or create shortlists

### 5. Content Sourcing
- Image scraping system from furniture retailers or Pinterest
- Regular content updates with new furniture options
- Proper attribution and linking to original sources
- Potential for sponsored content from furniture retailers

### 6. Future Enhancements
- Mood board creation tool
- Style profile generation based on likes/dislikes
- Direct purchase links to retailers
- AR visualization to see furniture in your space
- Recommendation engine based on previous preferences

## Technical Requirements

### Frontend
- React.js for UI development
- State management (Redux or Context API)
- Responsive design with CSS frameworks (e.g., Tailwind CSS)
- Animation libraries for smooth swiping interactions

### Backend
- API for user authentication and data storage
- Database to store user preferences and matches
- Image processing and storage solution
- Web scraping tools for furniture images

### Infrastructure
- Hosting solution (e.g., Vercel, Netlify)
- CI/CD pipeline for seamless deployment
- Analytics to track user behavior and preferences

## Recommended Technologies

### Build Tools & Environment
- Vite as the build tool and development environment (faster builds, HMR)
- pnpm for package management (faster, more efficient than npm)
- TypeScript for type safety and better developer experience
- ESLint and Prettier for code quality and formatting

### Frontend Libraries
- React Router for navigation
- React Query for data fetching and caching
- Framer Motion for smooth animations and gestures
- Tailwind CSS for utility-first styling
- Headless UI or Radix UI for accessible component primitives
- Zustand or Jotai for lightweight state management

### Backend & Infrastructure
- Supabase or Firebase for authentication, database, and storage
- Vercel or Netlify for hosting and serverless functions
- Cloudinary for image optimization and transformation
- GitHub Actions for CI/CD

### Testing
- Vitest for unit and integration testing
- Playwright for end-to-end testing
- MSW (Mock Service Worker) for API mocking

## Monetization Potential
- Affiliate links to furniture retailers
- Sponsored furniture listings
- Premium features for enhanced matching or visualization

## Project Phases

### Phase 1: MVP
- Basic user interface with swiping functionality
- Limited furniture categories
- Simple matching system
- Basic results page

### Phase 2: Enhanced Features
- User accounts and profiles
- Expanded furniture categories
- Improved matching algorithm
- Detailed results and comparison tools

### Phase 3: Advanced Features
- Mood board creation
- Integration with retailers
- Recommendation engine
- AR visualization

## Success Metrics
- Number of successful matches
- User engagement time
- Conversion rate to retailer websites
- User satisfaction with final furniture decisions 