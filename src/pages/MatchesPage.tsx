import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { FurnitureItem } from '../store/useStore'

const MatchesPage = () => {
  const { items, matches, currentUser, fetchUserLikes } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      if (currentUser) {
        await fetchUserLikes(currentUser.id)
      }
      
      setIsLoading(false)
    }
    
    loadData()
  }, [currentUser, fetchUserLikes])
  
  // Filter items to only show matches
  const matchedItems = items.filter(item => matches.includes(item.id))
  
  if (isLoading) {
    return (
      <div className="container-app py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      
      {matchedItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No matches yet</h2>
          <p className="mb-6">Start swiping to find furniture you both love!</p>
          <Link to="/swipe" className="btn btn-primary">Start Swiping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedItems.map((item, index) => (
            <MatchCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}

interface MatchCardProps {
  item: FurnitureItem
  index: number
}

const MatchCard = ({ item, index }: MatchCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card overflow-hidden"
    >
      <div className="relative h-48">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
          ♥
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1">{item.title}</h3>
        <p className="text-primary-600 font-semibold mb-2">{item.price}</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {item.category}
          </span>
          <button className="text-primary-600 hover:text-primary-800">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default MatchesPage 