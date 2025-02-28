import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const MatchesPage = () => {
  const items = useStore(state => state.items)
  const matches = useStore(state => state.matches)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  
  // Filter items to only show matches
  const matchedItems = items.filter(item => matches.includes(item.id))
  
  // Get the selected item details
  const selectedItemDetails = selectedItem 
    ? items.find(item => item.id === selectedItem) 
    : null
  
  return (
    <div className="container-app py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Your Matches</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Furniture that both of you liked
        </p>
      </div>
      
      {matchedItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4">No matches yet</h2>
          <p className="mb-4">
            You haven't matched on any furniture items yet. Keep swiping to find items you both love!
          </p>
          <Link to="/swipe" className="btn btn-primary">
            Back to Swiping
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`card cursor-pointer transform transition-transform hover:scale-105 ${selectedItem === item.id ? 'ring-4 ring-primary-500' : ''}`}
              onClick={() => setSelectedItem(item.id)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'
                  }}
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  Match!
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{item.description}</p>
                <p className="text-primary-600 font-bold mt-2">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Item detail modal */}
      {selectedItemDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <img 
                src={selectedItemDetails.imageUrl} 
                alt={selectedItemDetails.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold">{selectedItemDetails.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedItemDetails.description}</p>
              <p className="text-primary-600 font-bold text-xl mt-4">{selectedItemDetails.price}</p>
              
              <div className="mt-6 flex justify-between">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedItemDetails.title)}`, '_blank')}
                >
                  Find Online
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <div className="mt-8 text-center">
        <Link to="/swipe" className="btn btn-secondary">
          Continue Swiping
        </Link>
      </div>
    </div>
  )
}

export default MatchesPage 