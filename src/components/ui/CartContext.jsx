import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dang-cart');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error('Failed to parse cart from local storage', e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('dang-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, isCustomItem = false, customizations = null) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_type: isCustomItem ? 'list' : product.unit_type,
        unit_price: product.discount_price || product.base_price,
        base_price: product.base_price,
        discount_price: product.discount_price,
        category_name: product.category_name,
        image: product.images?.[0] || null,
        is_custom: isCustomItem, // Flag for UI
        customizations: customizations
      }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};