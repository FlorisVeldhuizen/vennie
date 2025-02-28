import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FurnitureCard from '../components/FurnitureCard'
import { useStore } from '../store/useStore'

// Constants for swipe behavior
const SWIPE_THRESHOLD = 100
const SWIPE_OUT_DISTANCE = 1000
const ANIMATION_DURATION = 300

const SwipePage = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAmount, setDragAmount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const startX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Get data from the store
  const items = useStore(state => state.items)
  const currentUser = useStore(state => state.currentUser)
  const addUserLike = useStore(state => state.addUserLike)
  
  const currentItem = items[currentIndex]
  const isFinished = currentIndex >= items.length
  
  // Define handleSwipe before using it in useEffect
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return // Prevent multiple swipes while animating
    
    setIsAnimating(true)
    const item = items[currentIndex]
    
    if (direction === 'right' && currentUser) {
      // Add to likes if swiped right
      addUserLike(item.id)
    }
    
    // Set final position for swipe out animation
    setDragAmount(direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE)
    
    // Move to the next item after animation completes
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setDragAmount(0) // Reset drag amount
      setIsAnimating(false)
    }, ANIMATION_DURATION)
  }, [isAnimating, items, currentIndex, currentUser, addUserLike])
  
  // Set up event listeners once when component mounts
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const currentX = e.clientX
      const newDragAmount = currentX - startX.current
      setDragAmount(newDragAmount)
    }
    
    const handleGlobalMouseUp = () => {
      if (!isDragging) return
      
      setIsDragging(false)
      
      // Check if dragged past threshold
      if (dragAmount > SWIPE_THRESHOLD) {
        handleSwipe('right')
      } else if (dragAmount < -SWIPE_THRESHOLD) {
        handleSwipe('left')
      } else {
        // Reset position if not swiped far enough
        setDragAmount(0)
      }
    }
    
    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    // Clean up event listeners when component unmounts
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragAmount, handleSwipe]) // Include handleSwipe in dependencies
  
  const handleViewMatches = () => {
    navigate('/matches')
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleSwipe('left')
    } else if (e.key === 'ArrowRight') {
      handleSwipe('right')
    }
  }
  
  // Mouse event handler - just sets the starting position and dragging state
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return
    e.preventDefault() // Prevent text selection
    startX.current = e.clientX
    setIsDragging(true)
  }
  
  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const newDragAmount = currentX - startX.current
    setDragAmount(newDragAmount)
  }
  
  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Check if dragged past threshold
    if (dragAmount > SWIPE_THRESHOLD) {
      handleSwipe('right')
    } else if (dragAmount < -SWIPE_THRESHOLD) {
      handleSwipe('left')
    } else {
      // Reset position if not swiped far enough
      setDragAmount(0)
    }
  }
  
  return (
    <div className="container-app py-8" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Find Furniture You Love</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Swipe right if you like it, left if you don't
        </p>
      </div>
      
      <div className="relative h-[500px] w-full max-w-sm mx-auto">
        {isFinished ? (
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">You're all caught up!</h2>
            <p className="mb-4">You've gone through all available items.</p>
            <button 
              className="btn btn-primary"
              onClick={handleViewMatches}
            >
              View Matches
            </button>
          </div>
        ) : (
          <div 
            ref={cardRef}
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
            />
          </div>
        )}
      </div>
      
      {!isFinished && (
        <div className="flex justify-center gap-4 mt-8">
          <button 
            className="btn bg-red-500 text-white hover:bg-red-600 rounded-full w-16 h-16 flex items-center justify-center"
            onClick={() => handleSwipe('left')}
            disabled={isAnimating}
          >
            ✕
          </button>
          <button 
            className="btn bg-green-500 text-white hover:bg-green-600 rounded-full w-16 h-16 flex items-center justify-center"
            onClick={() => handleSwipe('right')}
            disabled={isAnimating}
          >
            ♥
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center text-gray-500">
        <p>{currentIndex} of {items.length} items viewed</p>
        <div className="w-full max-w-sm mx-auto bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-primary-600 h-2.5 rounded-full" 
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default SwipePage 