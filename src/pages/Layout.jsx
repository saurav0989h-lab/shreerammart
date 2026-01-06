
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingCart from '@/components/cart/FloatingCart';
import { base44 } from '@/api/base44Client';
import { Toaster, toast } from 'sonner';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        console.log('Not authenticated');
      }
    };
    loadUser();

    // Check for shopping list checkout
    const shoppingListData = sessionStorage.getItem('shoppingListCheckout');
    if (shoppingListData && !['Checkout', 'MyShoppingLists'].includes(currentPageName)) {
      const listData = JSON.parse(shoppingListData);
      toast.info(`📋 Shopping List Ready (Rs. ${listData.estimatedTotal?.toLocaleString()}) - Add items or go to checkout`, {
        duration: 8000,
        action: {
          label: 'Checkout',
          onClick: () => window.location.href = '/Checkout'
        }
      });
    }
  }, [currentPageName]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Admin pages have their own layout
  const isAdminPage = currentPageName?.startsWith('Admin');

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-right" />
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
}
