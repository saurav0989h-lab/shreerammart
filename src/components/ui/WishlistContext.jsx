import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist', user?.email],
    queryFn: () => base44.entities.Wishlist.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Wishlist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.Wishlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const existingItem = wishlistItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      removeMutation.mutate(existingItem.id);
    } else {
      addMutation.mutate({
        user_email: user.email,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        product_price: product.discount_price || product.base_price
      });
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      isInWishlist, 
      toggleWishlist,
      wishlistCount: wishlistItems.length 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}