import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, ShoppingBag, Gift, Loader2, Heart } from 'lucide-react';
import ProfileInfo from '@/components/profile/ProfileInfo';
import SavedAddresses from '@/components/profile/SavedAddresses';
import OrderHistory from '@/components/profile/OrderHistory';
import LoyaltyPoints from '@/components/profile/LoyaltyPoints';
import Wishlist from '@/components/profile/Wishlist';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('UserProfile'));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['user-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user?.email
  });

  const updateUser = async (data) => {
    await base44.auth.updateMe(data);
    setUser(prev => ({ ...prev, ...data }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.full_name || 'Welcome!'}</h1>
              <p className="text-red-100">{user?.email}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" /> Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileInfo user={user} onUpdate={updateUser} />
          </TabsContent>

          <TabsContent value="wishlist">
            <Wishlist />
          </TabsContent>

          <TabsContent value="addresses">
            <SavedAddresses user={user} onUpdate={updateUser} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory orders={orders} />
          </TabsContent>

          <TabsContent value="rewards">
            <LoyaltyPoints user={user} orders={orders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}