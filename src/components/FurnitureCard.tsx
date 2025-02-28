import { FurnitureItem } from '../store/useStore'
import { useRef, useEffect, useState } from 'react'

interface FurnitureCardProps {
  item: FurnitureItem
  isDragging?: boolean
  dragAmount?: number
  dragAmountY?: number
  dragVelocity?: number
  onRest?: () => void
  isExiting?: boolean
  exitDirection?: 'left' | 'right'
  swipeThreshold: number
  isNew?: boolean
}

const FurnitureCard = ({ 
  item, 
  isDragging = false, 
  dragAmount = 0,
  dragAmountY = 0,
  dragVelocity = 0,
  onRest,
  isExiting = false,
  exitDirection,
  swipeThreshold,
  isNew = false
}: FurnitureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isResting, setIsResting] = useState(true)
  const [wobbleDirection, setWobbleDirection] = useState<'left' | 'right' | null>(null)
  const [hasEnteredView, setHasEnteredView] = useState(!isNew)
  
  // Calculate rotation based on drag amount and velocity for more dynamic feel
  const rotationX = Math.min(Math.max(dragAmountY * 0.05, -10), 10)
  const rotationZ = Math.min(Math.max((dragAmount * 0.05) + (dragVelocity * 0.1), -20), 20)
  
  // Calculate opacity for like/dislike indicators based on threshold
  const thresholdRatio = Math.min(Math.abs(dragAmount) / swipeThreshold, 1)
  
  // Dynamic shadow based on height and drag
  const shadowSize = 20 + Math.abs(dragAmountY) * 0.2 + Math.abs(dragAmount) * 0.05
  const shadowBlur = 30 + Math.abs(dragAmount) * 0.1 + Math.abs(dragVelocity) * 0.2
  
  // Handle entrance animation for new cards
  useEffect(() => {
    if (isNew && !hasEnteredView) {
      const timer = setTimeout(() => {
        setHasEnteredView(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isNew, hasEnteredView]);
  
  // Determine wobble direction based on where the card was last dragged
  useEffect(() => {
    if (isDragging) {
      setIsResting(false);
      setWobbleDirection(null);
    } else if (!isResting && Math.abs(dragAmount) < 5) {
      // Card was released - determine wobble direction based on last movement
      if (dragVelocity > 1) {
        setWobbleDirection('right');
      } else if (dragVelocity < -1) {
        setWobbleDirection('left');
      } else {
        setWobbleDirection(null);
      }
      
      // Reset to resting state after animation completes
      const timer = setTimeout(() => {
        setIsResting(true);
        if (onRest) onRest();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isDragging, dragAmount, dragVelocity, isResting, onRest]);
  
  // Get the appropriate wobble animation class
  const getWobbleClass = () => {
    if (isDragging || !isResting || isExiting) return '';
    
    if (wobbleDirection === 'right') {
      return 'wobble-right-animation';
    } else if (wobbleDirection === 'left') {
      return 'wobble-left-animation';
    } else if (Math.abs(dragAmount) < 5) {
      return 'float-animation';
    }
    
    return '';
  };
  
  // Calculate transition timing based on velocity
  const getTransitionTiming = () => {
    if (isDragging) return 'none';
    if (isExiting) return 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    if (!hasEnteredView) return 'none';
    
    // Faster snap-back when released with higher velocity
    const velocityFactor = Math.min(Math.abs(dragVelocity) * 0.001, 0.3);
    const duration = Math.max(0.3 - velocityFactor, 0.15);
    
    // Use spring physics for more natural movement
    return `transform ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease`;
  };
  
  // Get transform style based on state
  const getTransform = () => {
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
    
    if (!hasEnteredView) {
      return `
        translateY(-100vh)
        scale(0.9)
      `;
    }
    
    return `
      translateX(${dragAmount}px) 
      translateY(${dragAmountY * 0.5}px) 
      rotate3d(1, 0, 0, ${rotationX}deg) 
      rotateZ(${rotationZ}deg)
    `;
  };
  
  // Determine if we should show the LIKE/PASS indicator prominently
  const isPastThreshold = Math.abs(dragAmount) >= swipeThreshold * 0.8;
  const showIndicator = isPastThreshold || (isExiting && exitDirection);
  const indicatorType = (dragAmount > 0 || exitDirection === 'right') ? 'LIKE' : 'PASS';
  const indicatorColor = indicatorType === 'LIKE' 
    ? 'from-green-400 to-green-600' 
    : 'from-red-400 to-red-600';
  
  return (
    <div 
      ref={cardRef}
      className={`card h-full overflow-hidden flex flex-col rounded-2xl ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab hover:shadow-2xl hover:-translate-y-3'
      } ${getWobbleClass()}`}
      style={{
        transform: getTransform(),
        boxShadow: isDragging 
          ? `0 ${shadowSize}px ${shadowBlur}px rgba(0, 0, 0, 0.2)` 
          : '0 10px 30px rgba(0, 0, 0, 0.1)',
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