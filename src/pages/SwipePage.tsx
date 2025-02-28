import { useState, useRef, useEffect } from 'react'
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
  const [isNewCard, setIsNewCard] = useState(true)
  const [activeButton, setActiveButton] = useState<'left' | 'right' | null>(null)
  
  // Refs for drag tracking
  const startX = useRef(0)
  const startY = useRef(0)
  
  // Get data from the store
  const items = useStore(state => state.items)
  const currentUser = useStore(state => state.currentUser)
  const addUserLike = useStore(state => state.addUserLike)
  
  const currentItem = items[currentIndex]
  const isFinished = currentIndex >= items.length
  
  // Reset card position
  const resetCard = () => {
    setDragAmount(0)
    setDragAmountY(0)
    setActiveButton(null)
  }
  
  // Handle swipe action
  const handleSwipe = (direction: 'left' | 'right') => {
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
      setIsNewCard(true)
    }, ANIMATION_DURATION)
  }
  
  // Direct swipe for buttons and keyboard
  const directSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || isFinished) return
    
    // Set active button for visual feedback
    setActiveButton(direction)
    
    // Animation variables
    const targetX = direction === 'right' ? window.innerWidth : -window.innerWidth
    const animationDuration = 300 // ms
    const startTime = performance.now()
    
    // Animation function using requestAnimationFrame
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / animationDuration, 1)
      
      // Easing function for smooth animation (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      // Set the drag amount based on progress
      setDragAmount(targetX * 0.5 * eased)
      
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
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      directSwipe('left')
    } else if (e.key === 'ArrowRight') {
      directSwipe('right')
    }
  }
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return
    e.preventDefault() // Prevent text selection
    
    startX.current = e.clientX
    startY.current = e.clientY
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
      onKeyDown={handleKeyDown}
    >
      <div className="relative h-[550px] w-full max-w-sm mx-auto">
        {isFinished ? (
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
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          >
            <FurnitureCard
              key={currentItem.id}
              item={currentItem}
              isDragging={isDragging}
              dragAmount={dragAmount}
              dragAmountY={dragAmountY}
              onRest={() => setIsNewCard(false)}
              isExiting={isExiting}
              exitDirection={exitDirection || undefined}
              swipeThreshold={SWIPE_THRESHOLD}
              isNew={isNewCard}
            />
          </div>
        )}
      </div>
      
      {!isFinished && (
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
      
      {!isFinished && (
        <div className="mt-6 w-full max-w-sm mx-auto px-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentIndex / items.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {currentIndex} of {items.length}
          </div>
        </div>
      )}
    </div>
  )
}

export default SwipePage 