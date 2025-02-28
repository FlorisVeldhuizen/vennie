import { useEffect } from 'react';
import { FurnitureItem } from '../store/useStore';

interface ImagePreloaderProps {
  items: FurnitureItem[];
  currentIndex: number;
  preloadCount?: number;
}

/**
 * Component that preloads images for upcoming cards to prevent loading delays
 * when swiping through furniture items
 */
const ImagePreloader = ({ items, currentIndex, preloadCount = 3 }: ImagePreloaderProps) => {
  useEffect(() => {
    // Preload the next few images
    const preloadImages = () => {
      const imagesToPreload = [];
      
      // Calculate how many images to preload (don't go beyond array bounds)
      for (let i = 1; i <= preloadCount; i++) {
        const nextIndex = currentIndex + i;
        if (nextIndex < items.length) {
          imagesToPreload.push(items[nextIndex].imageUrl);
        }
      }
      
      // Create image objects to trigger browser preloading
      imagesToPreload.forEach(imageUrl => {
        const img = new Image();
        img.src = imageUrl;
      });
    };
    
    preloadImages();
  }, [items, currentIndex, preloadCount]);
  
  // This component doesn't render anything visible
  return null;
};

export default ImagePreloader; 