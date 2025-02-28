import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FurnitureCard from '../components/FurnitureCard'
import { useStore } from '../store/useStore'

// Constants for swipe behavior
const SWIPE_THRESHOLD = 200
const ANIMATION_DURATION = 800 // Longer duration for smoother exit animation

const SwipePage = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAmount, setDragAmount] = useState(0)
  const [dragAmountY, setDragAmountY] = useState(0)
  const [dragVelocity, setDragVelocity] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const lastMoveTime = useRef(Date.now())
  const velocityTracker = useRef<number[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Get data from the store
  const items = useStore(state => state.items)
  const currentUser = useStore(state => state.currentUser)
  const addUserLike = useStore(state => state.addUserLike)
  
  const currentItem = items[currentIndex]
  const isFinished = currentIndex >= items.length
  
  // Calculate average velocity from recent movements
  const calculateAverageVelocity = () => {
    if (velocityTracker.current.length === 0) return 0;
    
    const sum = velocityTracker.current.reduce((acc, val) => acc + val, 0);
    return sum / velocityTracker.current.length;
  };
  
  // Reset card position with physics based on velocity
  const resetCardPosition = () => {
    // Get the current velocity
    const velocity = calculateAverageVelocity();
    setDragVelocity(velocity);
    
    // If velocity is high but not enough to trigger swipe, add some bounce
    if (Math.abs(velocity) > 5 && Math.abs(dragAmount) < SWIPE_THRESHOLD) {
      // Bounce in the direction of the velocity but not enough to trigger swipe
      const bounceAmount = (velocity * 10) * (SWIPE_THRESHOLD / 150);
      setDragAmount(bounceAmount);
      
      // Add some vertical bounce too
      setDragAmountY(velocity > 0 ? -20 : 20);
      
      // Reset after the bounce animation
      setTimeout(() => {
        setDragAmount(0);
        setDragAmountY(0);
        setDragVelocity(0);
      }, 300);
    } else {
      // Just reset normally
      setDragAmount(0);
      setDragAmountY(0);
      setDragVelocity(0);
    }
  };
  
  // Define handleSwipe before using it in useEffect
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return // Prevent multiple swipes while animating
    
    setIsAnimating(true)
    setIsExiting(true)
    setExitDirection(direction)
    
    const item = items[currentIndex]
    
    if (direction === 'right' && currentUser) {
      // Add to likes if swiped right
      addUserLike(item.id)
    }
    
    // Move to the next item after animation completes
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setDragAmount(0) // Reset drag amount
      setDragAmountY(0) // Reset vertical drag
      setDragVelocity(0) // Reset velocity
      setIsAnimating(false)
      setIsExiting(false)
      setExitDirection(null)
      velocityTracker.current = []; // Clear velocity tracker
    }, ANIMATION_DURATION)
  }, [isAnimating, items, currentIndex, currentUser, addUserLike])
  
  // Handle card rest callback
  const handleCardRest = useCallback(() => {
    velocityTracker.current = [];
    setDragVelocity(0);
  }, []);
  
  // Set up event listeners once when component mounts
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const currentX = e.clientX
      const currentY = e.clientY
      const newDragAmount = currentX - startX.current
      const newDragAmountY = currentY - startY.current
      
      // Calculate velocity
      const now = Date.now();
      const timeDelta = now - lastMoveTime.current;
      if (timeDelta > 0) {
        const xDelta = currentX - lastX.current;
        const instantVelocity = xDelta / timeDelta * 16; // Normalize to roughly 60fps
        
        // Keep a rolling window of the last 5 velocity measurements
        velocityTracker.current.push(instantVelocity);
        if (velocityTracker.current.length > 5) {
          velocityTracker.current.shift();
        }
        
        // Update velocity state occasionally (not on every frame to avoid too many rerenders)
        if (velocityTracker.current.length % 2 === 0) {
          setDragVelocity(calculateAverageVelocity());
        }
      }
      
      // Update last position and time
      lastX.current = currentX;
      lastY.current = currentY;
      lastMoveTime.current = now;
      
      setDragAmount(newDragAmount)
      setDragAmountY(newDragAmountY)
    }
    
    const handleGlobalMouseUp = () => {
      if (!isDragging) return
      
      setIsDragging(false)
      
      // Calculate final velocity
      const finalVelocity = calculateAverageVelocity();
      setDragVelocity(finalVelocity);
      
      // Check if dragged past threshold or if velocity is high enough for a "flick"
      const isFlick = Math.abs(finalVelocity) > 20;
      
      if (dragAmount > SWIPE_THRESHOLD || (isFlick && finalVelocity > 0)) {
        handleSwipe('right')
      } else if (dragAmount < -SWIPE_THRESHOLD || (isFlick && finalVelocity < 0)) {
        handleSwipe('left')
      } else {
        // Reset position with physics-based animation
        resetCardPosition();
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
  }, [isDragging, dragAmount, dragAmountY, handleSwipe]) // Include dragAmountY in dependencies
  
  const handleViewMatches = () => {
    navigate('/matches')
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setDragVelocity(-10);
      handleSwipe('left')
    } else if (e.key === 'ArrowRight') {
      setDragVelocity(10);
      handleSwipe('right')
    }
  }
  
  // Mouse event handler - just sets the starting position and dragging state
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return
    e.preventDefault() // Prevent text selection
    
    // Reset velocity tracker
    velocityTracker.current = [];
    
    // Set initial positions
    startX.current = e.clientX
    startY.current = e.clientY
    lastX.current = e.clientX
    lastY.current = e.clientY
    lastMoveTime.current = Date.now()
    
    setIsDragging(true)
    setDragVelocity(0)
  }
  
  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    
    // Reset velocity tracker
    velocityTracker.current = [];
    
    // Set initial positions
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    lastX.current = e.touches[0].clientX
    lastY.current = e.touches[0].clientY
    lastMoveTime.current = Date.now()
    
    setIsDragging(true)
    setDragVelocity(0)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const newDragAmount = currentX - startX.current
    const newDragAmountY = currentY - startY.current
    
    // Calculate velocity
    const now = Date.now();
    const timeDelta = now - lastMoveTime.current;
    if (timeDelta > 0) {
      const xDelta = currentX - lastX.current;
      const instantVelocity = xDelta / timeDelta * 16; // Normalize to roughly 60fps
      
      // Keep a rolling window of the last 5 velocity measurements
      velocityTracker.current.push(instantVelocity);
      if (velocityTracker.current.length > 5) {
        velocityTracker.current.shift();
      }
      
      // Update velocity state occasionally
      if (velocityTracker.current.length % 2 === 0) {
        setDragVelocity(calculateAverageVelocity());
      }
    }
    
    // Update last position and time
    lastX.current = currentX;
    lastY.current = currentY;
    lastMoveTime.current = now;
    
    setDragAmount(newDragAmount)
    setDragAmountY(newDragAmountY)
  }
  
  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Calculate final velocity
    const finalVelocity = calculateAverageVelocity();
    setDragVelocity(finalVelocity);
    
    // Check if dragged past threshold or if velocity is high enough for a "flick"
    const isFlick = Math.abs(finalVelocity) > 20;
    
    if (dragAmount > SWIPE_THRESHOLD || (isFlick && finalVelocity > 0)) {
      handleSwipe('right')
    } else if (dragAmount < -SWIPE_THRESHOLD || (isFlick && finalVelocity < 0)) {
      handleSwipe('left')
    } else {
      // Reset position with physics-based animation
      resetCardPosition();
    }
  }
  
  return (
    <div className="container-app py-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 mb-3">Find Furniture You Love</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Swipe right if you like it, left if you don't
        </p>
      </div>
      
      <div className="relative h-[550px] w-full max-w-sm mx-auto perspective-1000">
        {isFinished ? (
          <div className="card p-10 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4 text-primary-600 dark:text-primary-400">You're all caught up!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300 text-lg">You've gone through all available items.</p>
            <button 
              className="btn bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
              dragAmountY={dragAmountY}
              dragVelocity={dragVelocity}
              onRest={handleCardRest}
              isExiting={isExiting}
              exitDirection={exitDirection || undefined}
            />
          </div>
        )}
      </div>
      
      {!isFinished && (
        <div className="flex justify-center gap-6 mt-10">
          <button 
            className="btn bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setDragVelocity(-10);
              handleSwipe('left');
            }}
            disabled={isAnimating}
          >
            ✕
          </button>
          <button 
            className="btn bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setDragVelocity(10);
              handleSwipe('right');
            }}
            disabled={isAnimating}
          >
            ♥
          </button>
        </div>
      )}
      
      <div className="mt-10 text-center text-gray-500">
        <p className="text-lg">{currentIndex} of {items.length} items viewed</p>
        <div className="w-full max-w-sm mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default SwipePage 