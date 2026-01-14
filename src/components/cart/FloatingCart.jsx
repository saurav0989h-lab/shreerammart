import { useState, useEffect } from 'react';
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
  const prevCartCount = usePrevious(cartCount);

  // Ensure component is mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show notification when item is added
  useEffect(() => {
    if (cartCount > (prevCartCount || 0)) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }, [cartCount, prevCartCount]);

  // Don't render on server or if cart is empty
  if (!isMounted || cartCount === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-auto"
      >
        <Link to={createPageUrl('Cart')} className="block">
          <Button
            className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center"
          >
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg"
            >
              {cartCount}
            </motion.div>
          </Button>
        </Link>

        {/* Item Added Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-16 sm:bottom-20 right-0 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm sm:text-base"
            >
              ✓ Item added to cart!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// Custom hook to track previous value
function usePrevious(value) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    if (value !== current) {
      setPrevious(current);
      setCurrent(value);
    }
  }, [value, current]);

  return previous;
}
