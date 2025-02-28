import { FurnitureItem } from '../store/useStore'
import { useRef, useEffect } from 'react'

interface FurnitureCardProps {
  item: FurnitureItem
  isDragging?: boolean
  dragAmount?: number
  dragAmountY?: number
  onRest?: () => void
  isExiting?: boolean
  exitDirection?: 'left' | 'right'
  swipeThreshold: number
  isHovering?: boolean
}

const FurnitureCard = ({ 
  item, 
  isDragging = false, 
  dragAmount = 0,
  dragAmountY = 0,
  onRest,
  isExiting = false,
  exitDirection,
  swipeThreshold,
  isHovering = false
}: FurnitureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const prevDraggingRef = useRef(isDragging)
  
  // Calculate rotation based on drag amount for dynamic feel
  const rotationDegrees = Math.min(Math.max((dragAmount * 0.05), -15), 15)
  
  // Calculate opacity for like/dislike indicators based on threshold
  const thresholdRatio = Math.min(Math.abs(dragAmount) / swipeThreshold, 1)
  
  // Call onRest when dragging ends
  useEffect(() => {
    if (!isDragging && prevDraggingRef.current && onRest) {
      const timer = setTimeout(() => {
        onRest();
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    prevDraggingRef.current = isDragging;
  }, [isDragging, onRest]);
  
  // Get transform style based on state
  const getTransform = () => {
    // Exit animation
    if (isExiting) {
      const direction = exitDirection === 'left' ? -1 : 1;
      const distance = window.innerWidth * 1.5;
      const rotation = direction * 30;
      return `
        translateX(${direction * distance}px)
        translateY(${dragAmountY * 2}px)
        rotate(${rotation}deg)
      `;
    }
    
    // Base lift effect (applied during hover or dragging)
    const liftAmount = (isHovering || isDragging) ? -8 : 0;
    
    // Combine translation, rotation and lift
    return `
      translateX(${dragAmount}px) 
      translateY(${dragAmountY * 0.5 + liftAmount}px) 
      rotate(${rotationDegrees}deg)
      scale(${isDragging ? 1.03 : isHovering ? 1.02 : 1})
    `;
  };
  
  // Get transition timing
  const getTransitionTiming = () => {
    if (isDragging) return 'none';
    if (isExiting) return 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    return 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
  };
  
  // Determine if we should show the LIKE/PASS indicator prominently
  const isPastThreshold = Math.abs(dragAmount) >= swipeThreshold * 0.8;
  const showIndicator = isPastThreshold || (isExiting && exitDirection);
  const indicatorType = (dragAmount > 0 || exitDirection === 'right') ? 'LIKE' : 'PASS';
  const indicatorColor = indicatorType === 'LIKE' 
    ? 'from-green-400 to-green-600' 
    : 'from-red-400 to-red-600';
  
  // Get shadow based on state
  const getShadow = () => {
    if (isDragging) {
      return '0 25px 40px rgba(0, 0, 0, 0.2)';
    } else if (isHovering) {
      return '0 20px 35px rgba(0, 0, 0, 0.15)';
    } else {
      return '0 10px 30px rgba(0, 0, 0, 0.1)';
    }
  };
  
  return (
    <div 
      ref={cardRef}
      className={`card h-full overflow-hidden flex flex-col rounded-2xl ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        transform: getTransform(),
        boxShadow: getShadow(),
        transition: getTransitionTiming(),
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        zIndex: 10,
        background: 'white',
        border: '1px solid rgba(0,0,0,0.05)',
        transformOrigin: 'center center',
      }}
    >
      <div className="relative flex-grow overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
          draggable="false"
        />
        
        {/* Main indicator */}
        <div 
          className={`absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-br ${indicatorColor} text-white rounded-full py-4 px-8 text-3xl font-bold pointer-events-none shadow-lg transition-all duration-300`}
          style={{ 
            zIndex: 20,
            opacity: showIndicator ? 1 : thresholdRatio * 0.7,
            transform: `translate(50%, -50%) scale(${showIndicator ? 1 : 0.8 + thresholdRatio * 0.2})`,
          }}
        >
          {indicatorType}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white">{item.title}</h3>
          <p className="text-xl font-semibold text-white/90">{item.price}</p>
        </div>
      </div>
      
      <div className="p-5 bg-white dark:bg-gray-800">
        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{item.description}</p>
        <div className="mt-3">
          <span className="inline-block bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold text-primary-700 dark:text-primary-200">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FurnitureCard 