import { FurnitureItem } from '../store/useStore'

interface FurnitureCardProps {
  item: FurnitureItem
  isDragging?: boolean
  dragAmount?: number
}

const FurnitureCard = ({ item, isDragging = false, dragAmount = 0 }: FurnitureCardProps) => {
  // Calculate rotation based on drag amount (between -15 and 15 degrees)
  const rotation = Math.min(Math.max(dragAmount * 0.05, -15), 15)
  
  // Calculate opacity for like/dislike indicators
  const likeOpacity = dragAmount > 0 ? Math.min(dragAmount / 100, 1) : 0
  const dislikeOpacity = dragAmount < 0 ? Math.min(Math.abs(dragAmount) / 100, 1) : 0
  
  return (
    <div 
      className={`card h-full overflow-hidden flex flex-col ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab hover:shadow-xl hover:-translate-y-2'
      }`}
      style={{
        transform: `translateX(${dragAmount}px) rotate(${rotation}deg)`,
        boxShadow: isDragging ? '0 10px 25px rgba(0, 0, 0, 0.2)' : '',
        transition: isDragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="relative flex-grow">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
          draggable="false"
        />
        
        {/* Like indicator */}
        <div 
          className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-3 text-xl font-bold transform rotate-12 pointer-events-none"
          style={{ 
            opacity: likeOpacity,
            transition: isDragging ? 'none' : 'opacity 0.2s ease'
          }}
        >
          LIKE
        </div>
        
        {/* Dislike indicator */}
        <div 
          className="absolute top-4 left-4 bg-red-500 text-white rounded-full p-3 text-xl font-bold transform -rotate-12 pointer-events-none"
          style={{ 
            opacity: dislikeOpacity,
            transition: isDragging ? 'none' : 'opacity 0.2s ease'
          }}
        >
          PASS
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <h3 className="text-xl font-bold">{item.title}</h3>
          <p className="text-lg font-semibold">{item.price}</p>
        </div>
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-800">
        <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
        <div className="mt-2">
          <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FurnitureCard 