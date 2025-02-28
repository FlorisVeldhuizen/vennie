import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FurnitureCard from '../components/FurnitureCard'
import { useStore } from '../store/useStore'

// Constants for swipe behavior
const SWIPE_THRESHOLD = 200
const ANIMATION_DURATION = 800

const SwipePage = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAmount, setDragAmount] = useState(0)
  const [dragAmountY, setDragAmountY] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [activeButton, setActiveButton] = useState<'left' | 'right' | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs for drag tracking
  const startX = useRef(0)
  const startY = useRef(0)
  const lastX = useRef(0)
  const lastTimestamp = useRef(0)
  
  // Get data from the store
  const items = useStore(state => state.items)
  const currentUser = useStore(state => state.currentUser)
  const addUserLike = useStore(state => state.addUserLike)
  const fetchItems = useStore(state => state.fetchItems)
  const isLoadingItems = useStore(state => state.isLoadingItems)
  
  // Ensure we have furniture items
  useEffect(() => {
    const initializeData = async () => {
      if (items.length === 0 && !isLoadingItems) {
        await fetchItems()
      }
      setIsInitialized(true)
    }
    
    initializeData()
  }, [items.length, isLoadingItems, fetchItems])
  
  const currentItem = items[currentIndex]
  const nextItem = items[currentIndex + 1]
  const isFinished = !currentItem || currentIndex >= items.length
  
  // Reset card position
  const resetCard = useCallback(() => {
    setDragAmount(0)
    setDragAmountY(0)
    setActiveButton(null)
  }, [])
  
  // Preload next images
  const preloadNextImages = useCallback(() => {
    // Preload the next few images
    const preloadCount = 3;
    const imagesToPreload = [];
    
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < items.length) {
        imagesToPreload.push(items[nextIndex].imageUrl);
      }
    }
    
    // Create image objects to trigger browser preloading
    imagesToPreload.forEach(imageUrl => {
      const img = new Image();
      img.src = imageUrl;
    });
  }, [currentIndex, items]);
  
  // Preload images when current index changes
  useEffect(() => {
    preloadNextImages();
  }, [currentIndex, preloadNextImages]);
  
  // Handle swipe action
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating || isFinished) return
    
    setIsAnimating(true)
    setIsExiting(true)
    setExitDirection(direction)
    setActiveButton(direction)
    
    if (direction === 'right' && currentUser) {
      addUserLike(currentItem.id)
    }
    
    // Move to the next item after animation completes
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      resetCard()
      setIsAnimating(false)
      setIsExiting(false)
      setExitDirection(null)
    }, ANIMATION_DURATION)
  }, [isAnimating, isFinished, currentUser, currentItem, addUserLike, resetCard])
  
  // Direct swipe for buttons and keyboard
  const directSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating || isFinished) return
    
    // Set active button for visual feedback
    setActiveButton(direction)
    
    // Animation variables
    const targetX = direction === 'right' ? window.innerWidth : -window.innerWidth
    const animationDuration = 600 // ms - longer for smoother animation
    const startTime = performance.now()
    
    // Animation function using requestAnimationFrame
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / animationDuration, 1)
      
      // Smoother easing function - cubic bezier approximation
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      
      // Set the drag amount based on progress with gentler movement
      setDragAmount(targetX * 0.4 * eased)
      
      // Add some subtle vertical movement
      setDragAmountY(Math.sin(progress * Math.PI) * 15)
      
      if (progress < 1) {
        // Continue animation
        requestAnimationFrame(animate)
      } else {
        // Animation complete, trigger the actual swipe
        handleSwipe(direction)
      }
    }
    
    // Start animation
    requestAnimationFrame(animate)
  }, [isAnimating, isFinished, handleSwipe])
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    if (isAnimating || isFinished) return
    
    if (e.key === 'ArrowLeft') {
      directSwipe('left')
    } else if (e.key === 'ArrowRight') {
      directSwipe('right')
    }
  }, [directSwipe, isAnimating, isFinished])
  
  // Set up global keyboard event listener
  useEffect(() => {
    // Add global keyboard listener
    document.addEventListener('keydown', handleKeyDown)
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown]) // Include handleKeyDown in dependencies
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return
    e.preventDefault() // Prevent text selection
    
    startX.current = e.clientX
    startY.current = e.clientY
    lastX.current = e.clientX
    lastTimestamp.current = performance.now()
    setIsDragging(true)
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newDragAmount = e.clientX - startX.current
    const newDragAmountY = e.clientY - startY.current
    
    setDragAmount(newDragAmount)
    setDragAmountY(newDragAmountY)
    
    // Update active button based on drag direction
    if (Math.abs(newDragAmount) > 20) {
      setActiveButton(newDragAmount > 0 ? 'right' : 'left')
    } else {
      setActiveButton(null)
    }
  }
  
  const handleMouseUp = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (dragAmount > SWIPE_THRESHOLD) {
      handleSwipe('right')
    } else if (dragAmount < -SWIPE_THRESHOLD) {
      handleSwipe('left')
    } else {
      resetCard()
    }
  }
  
  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    lastX.current = e.touches[0].clientX
    lastTimestamp.current = performance.now()
    setIsDragging(true)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const newDragAmount = e.touches[0].clientX - startX.current
    const newDragAmountY = e.touches[0].clientY - startY.current
    
    setDragAmount(newDragAmount)
    setDragAmountY(newDragAmountY)
    
    // Update active button
    if (Math.abs(newDragAmount) > 20) {
      setActiveButton(newDragAmount > 0 ? 'right' : 'left')
    } else {
      setActiveButton(null)
    }
  }
  
  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (dragAmount > SWIPE_THRESHOLD) {
      handleSwipe('right')
    } else if (dragAmount < -SWIPE_THRESHOLD) {
      handleSwipe('left')
    } else {
      resetCard()
    }
  }
  
  // Mouse hover handlers
  const handleMouseEnter = () => {
    if (!isDragging && !isAnimating) {
      setIsHovering(true)
    }
  }
  
  const handleMouseLeave = () => {
    setIsHovering(false)
  }
  
  // Set up event listeners for mouse dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragAmount])
  
  // Prevent scrollbar
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden" 
      tabIndex={0}
    >
      <div className="relative h-[550px] w-full max-w-sm mx-auto">
        {isLoadingItems || !isInitialized ? (
          <div className="card p-10 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400">Loading furniture...</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Please wait while we prepare some amazing furniture for you.</p>
          </div>
        ) : isFinished ? (
          <div className="card p-10 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4 text-primary-600 dark:text-primary-400">You're all caught up!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300 text-lg">You've gone through all available items.</p>
            <button 
              className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => navigate('/matches')}
            >
              View Matches
            </button>
          </div>
        ) : (
          <div 
            className="h-full w-full select-none"
            style={{ touchAction: 'none' }}
          >
            {/* Next card (shown behind current card) */}
            {nextItem && (
              <div 
                className={`absolute inset-0 z-0 transform translate-y-2 scale-[0.98] transition-transform duration-300 ${
                  isExiting ? 'translate-y-0 scale-100' : ''
                }`}
              >
                <FurnitureCard
                  key={`next-${nextItem.id}`}
                  item={nextItem}
                  isDragging={false}
                  dragAmount={0}
                  dragAmountY={0}
                  onRest={() => {}}
                  isExiting={false}
                  swipeThreshold={SWIPE_THRESHOLD}
                  isHovering={false}
                  isNextCard={true}
                />
              </div>
            )}
            
            {/* Current card (top layer) */}
            <div 
              className="absolute inset-0 z-10"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <FurnitureCard
                key={currentItem.id}
                item={currentItem}
                isDragging={isDragging}
                dragAmount={dragAmount}
                dragAmountY={dragAmountY}
                onRest={() => {}}
                isExiting={isExiting}
                exitDirection={exitDirection || undefined}
                swipeThreshold={SWIPE_THRESHOLD}
                isHovering={isHovering}
              />
            </div>
          </div>
        )}
      </div>
      
      {!isLoadingItems && !isFinished && isInitialized && (
        <div className="flex justify-center gap-6 mt-6">
          <button 
            className={`btn bg-gradient-to-r ${
              activeButton === 'left' 
                ? 'from-red-500 to-red-700 scale-110 shadow-xl' 
                : 'from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 hover:scale-110 hover:shadow-xl'
            } text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => directSwipe('left')}
            disabled={isAnimating}
            aria-label="Pass"
          >
            ✕
          </button>
          <button 
            className={`btn bg-gradient-to-r ${
              activeButton === 'right' 
                ? 'from-green-500 to-green-700 scale-110 shadow-xl' 
                : 'from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:scale-110 hover:shadow-xl'
            } text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => directSwipe('right')}
            disabled={isAnimating}
            aria-label="Like"
          >
            ♥
          </button>
        </div>
      )}
      
      {!isLoadingItems && !isFinished && isInitialized && (
        <div className="mt-6 w-full max-w-sm mx-auto px-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentIndex / items.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {currentIndex + 1} of {items.length}
          </div>
          <div className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center">
            <span className="mr-1">Pro tip: Use</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 mx-1">←</kbd>
            <span className="mx-1">and</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 mx-1">→</kbd>
            <span className="ml-1">arrow keys to swipe</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwipePage 