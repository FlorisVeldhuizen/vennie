import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SwipeCard from '../components/ui/SwipeCard'
import { useStore } from '../store/useStore'

const SwipePage = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Get data from the store
  const items = useStore(state => state.items)
  const currentUser = useStore(state => state.currentUser)
  const addUserLike = useStore(state => state.addUserLike)
  
  const currentItem = items[currentIndex]
  const isFinished = currentIndex >= items.length
  
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
  
  return (
    <div className="container-app py-8">
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
          <SwipeCard
            key={currentItem.id}
            imageUrl={currentItem.imageUrl}
            title={currentItem.title}
            description={currentItem.description}
            price={currentItem.price}
            onSwipe={handleSwipe}
          />
        )}
      </div>
      
      {!isFinished && (
        <div className="flex justify-center gap-4 mt-8">
          <button 
            className="btn bg-red-500 text-white hover:bg-red-600 rounded-full w-16 h-16 flex items-center justify-center"
            onClick={() => handleSwipe('left')}
          >
            ✕
          </button>
          <button 
            className="btn bg-green-500 text-white hover:bg-green-600 rounded-full w-16 h-16 flex items-center justify-center"
            onClick={() => handleSwipe('right')}
          >
            ♥
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center text-gray-500">
        <p>{currentIndex} of {items.length} items viewed</p>
      </div>
    </div>
  )
}

export default SwipePage 