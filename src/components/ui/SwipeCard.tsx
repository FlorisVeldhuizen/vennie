import { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion'

interface SwipeCardProps {
  imageUrl: string
  title: string
  description?: string
  price?: string
  onSwipe: (direction: 'left' | 'right') => void
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  imageUrl,
  title,
  description,
  price,
  onSwipe,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exitX, setExitX] = useState<number>(0)
  const controls = useAnimation()
  
  // Motion values for the drag gesture
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  
  // Background colors for like/dislike indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0])
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleSwipe('left')
    } else if (e.key === 'ArrowRight') {
      handleSwipe('right')
    }
  }
  
  const handleSwipe = (direction: 'left' | 'right') => {
    const xOffset = direction === 'left' ? -200 : 200
    setExitX(xOffset)
    
    controls.start({
      x: xOffset,
      transition: { duration: 0.3 }
    }).then(() => {
      onSwipe(direction)
    })
  }
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      handleSwipe('right') // Liked
    } else if (info.offset.x < -threshold) {
      handleSwipe('left') // Disliked
    } else {
      // Return to center if not swiped far enough
      controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      })
    }
  }
  
  return (
    <motion.div
      ref={cardRef}
      className="absolute w-full max-w-sm mx-auto"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="card relative aspect-[3/4] overflow-hidden">
        {/* Image with proper sizing */}
        <div className="w-full h-full">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback for broken images
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Image+Not+Found'
            }}
          />
        </div>
        
        {/* Like/Dislike Indicators */}
        <motion.div 
          className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl transform rotate-12 shadow-lg"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        
        <motion.div 
          className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl transform -rotate-12 shadow-lg"
          style={{ opacity: dislikeOpacity }}
        >
          NOPE
        </motion.div>
        
        {/* Info overlay with improved styling */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white p-4">
          <h3 className="text-xl font-bold">{title}</h3>
          {description && <p className="text-sm mt-1 line-clamp-2">{description}</p>}
          {price && <p className="text-lg font-bold mt-2">{price}</p>}
        </div>
      </div>
      
      {/* Swipe instructions - visible on larger screens */}
      <div className="absolute -bottom-12 left-0 right-0 text-center text-sm text-gray-500 hidden md:block">
        <p>Swipe left to dislike, right to like, or use arrow keys</p>
      </div>
    </motion.div>
  )
}

export default SwipeCard 