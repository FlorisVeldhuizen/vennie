import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SwipeCard from '../components/ui/SwipeCard'
import { useStore } from '../store/useStore'

const SwipePage = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get data from the store
  const items = useStore(state => state.items)
  const currentUser = useStore(state => state.currentUser)
  const addUserLike = useStore(state => state.addUserLike)
  
  const currentItem = items[currentIndex]
  const isFinished = currentIndex >= items.length
  
  // Simulate loading of furniture items
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const handleSwipe = (direction: 'left' | 'right') => {
    const item = items[currentIndex]
    
    if (direction === 'right' && currentUser) {
      // Add to likes if swiped right
      addUserLike(item.id)
    }
    
    // Move to the next item after a short delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
    }, 300)
  }
  
  const handleViewMatches = () => {
    navigate('/matches')
  }
  
  if (isLoading) {
    return (
      <div className="container-app py-8 flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading furniture...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-app py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Find Furniture You Love</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Swipe right if you like it, left if you don't
        </p>
      </div>
      
      <div className="relative h-[500px] w-full max-w-sm mx-auto">
        <AnimatePresence>
          {isFinished ? (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">You're all caught up!</h2>
              <p className="mb-4">You've gone through all available items.</p>
              <button 
                className="btn btn-primary"
                onClick={handleViewMatches}
              >
                View Matches
              </button>
            </motion.div>
          ) : (
            <SwipeCard
              key={currentItem.id}
              imageUrl={currentItem.imageUrl}
              title={currentItem.title}
              description={currentItem.description}
              price={currentItem.price}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>
      
      {!isFinished && (
        <div className="flex justify-center gap-4 mt-8">
          <motion.button 
            className="btn bg-red-500 text-white hover:bg-red-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            onClick={() => handleSwipe('left')}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
          <motion.button 
            className="btn bg-green-500 text-white hover:bg-green-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            onClick={() => handleSwipe('right')}
            whileTap={{ scale: 0.9 }}
          >
            ♥
          </motion.button>
        </div>
      )}
      
      <div className="mt-8 text-center text-gray-500">
        <p>{currentIndex} of {items.length} items viewed</p>
        
        {/* Progress bar */}
        <div className="w-full max-w-sm mx-auto mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-primary-500 h-2.5 rounded-full" 
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default SwipePage 