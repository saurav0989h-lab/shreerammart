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
  const prevCartCount = usePrevious(cartCount);

  // Show notification when item is added
  useEffect(() => {
    if (cartCount > (prevCartCount || 0)) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }, [cartCount, prevCartCount]);

  if (cartCount === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link to={createPageUrl('Cart')}>
          <Button
            className="relative h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all"
          >
            <ShoppingBag className="w-7 h-7" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
            >
              {cartCount}
            </motion.div>
          </Button>
        </Link>

        {/* Item Added Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute bottom-20 right-0 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
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
