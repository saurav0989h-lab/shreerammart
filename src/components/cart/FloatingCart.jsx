import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/ui/CartContext';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCart() {
  const { cartCount } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Custom hook usage
  const prevCartCount = usePrevious(cartCount);

  // 1. Handle Hydration (Prevent SSR mismatch)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Notification Logic
  useEffect(() => {
    // Only show if count INCREASED
    if (prevCartCount !== undefined && cartCount > prevCartCount) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartCount, prevCartCount]);

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      
      {/* Item Added Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium mb-2 pointer-events-auto"
          >
            Item added to cart!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="pointer-events-auto"
          >
            <Link to={createPageUrl('Cart')}>
              <Button
                size="icon"
                aria-label={`View Cart with ${cartCount} items`}
                className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                
                {/* Red Badge Counter */}
                <motion.div
                  key={cartCount} // Key change triggers the animation on update
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md border-2 border-white dark:border-gray-800"
                >
                  {cartCount}
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Optimized Hook: Uses useRef to avoid triggering re-renders
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}