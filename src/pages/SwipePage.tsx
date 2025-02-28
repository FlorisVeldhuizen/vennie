import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import FurnitureCard from '../components/FurnitureCard'
import { toast } from 'react-hot-toast'

const SwipePage = () => {
  const { items, currentUser, addUserLike, fetchUserLikes } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [direction, setDirection] = useState<string | null>(null)
  
  // Mouse/touch dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragAmount, setDragAmount] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Threshold for swipe action (in pixels)
  const SWIPE_THRESHOLD = 100

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Fetch user likes if we have a current user
    if (currentUser) {
      fetchUserLikes(currentUser.id)
    }

    return () => clearTimeout(timer)
  }, [currentUser, fetchUserLikes])

  const handleSwipe = (dir: string) => {
    setDirection(dir)
    
    // If swiping right, add to likes
    if (dir === 'right' && items[currentIndex]) {
      addUserLike(items[currentIndex].id)
      toast.success('Added to likes!')
    }
    
    // Wait for animation to complete before changing index
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setDirection(null)
    }, 300)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || currentIndex >= items.length) return
      
      if (e.key === 'ArrowLeft') {
        handleSwipe('left')
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, currentIndex, items.length])
  
  // Mouse/touch event handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLoading || currentIndex >= items.length) return
    
    setIsDragging(true)
    // Get the starting X position (handle both mouse and touch events)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
  }
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    
    // Get the current X position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - dragStartX
    
    setDragAmount(deltaX)
    
    // Prevent default to avoid text selection during drag
    e.preventDefault()
  }
  
  const handleDragEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // If dragged beyond threshold, trigger swipe
    if (Math.abs(dragAmount) >= SWIPE_THRESHOLD) {
      const direction = dragAmount > 0 ? 'right' : 'left'
      handleSwipe(direction)
    }
    
    // Reset drag amount
    setDragAmount(0)
  }
  
  // Add event listeners for mouse/touch events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e as unknown as React.MouseEvent)
      }
    }
    
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd()
      }
    }
    
    // Add global event listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove as unknown as (e: TouchEvent) => void, { passive: false })
    window.addEventListener('touchend', handleMouseUp)
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove as unknown as (e: TouchEvent) => void)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, dragStartX])

  if (isLoading) {
    return (
      <div className="container-app py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (currentIndex >= items.length) {
    return (
      <div className="container-app py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">You've seen all items!</h2>
        <p className="mb-6">Check back later for more furniture options.</p>
        <Link to="/matches" className="btn btn-primary">View Your Matches</Link>
      </div>
    )
  }

  return (
    <div className="container-app py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Swipe Furniture</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Swipe right to like, left to pass
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div 
          ref={cardRef}
          className="relative w-full max-w-md aspect-[3/4]"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <AnimatePresence>
            {!direction && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ 
                  opacity: 0,
                  x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                  rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <FurnitureCard 
                  item={items[currentIndex]} 
                  isDragging={isDragging}
                  dragAmount={dragAmount}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleSwipe('left')}
          className="btn btn-secondary px-8"
          aria-label="Dislike"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="btn btn-primary px-8"
          aria-label="Like"
        >
          ♥
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Tip: You can also use the left and right arrow keys or drag with your mouse</p>
      </div>
    </div>
  )
}

export default SwipePage 