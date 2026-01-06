import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Truck, DollarSign, Settings, Save, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDeliverySettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    free_delivery_radius_km: 10,
    min_order_for_free_delivery: 500,
    base_delivery_fee: 50,
    per_km_charge: 10
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(userData);
      } catch (e) {
        navigate(createPageUrl('AdminLogin'));
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: existingSettings } = useQuery({
    queryKey: ['delivery-settings'],
    queryFn: async () => {
      const result = await base44.entities.DeliverySettings.list();
      return result[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({
        free_delivery_radius_km: existingSettings.free_delivery_radius_km,
        min_order_for_free_delivery: existingSettings.min_order_for_free_delivery,
        base_delivery_fee: existingSettings.base_delivery_fee,
        per_km_charge: existingSettings.per_km_charge
      });
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings) {
        return await base44.entities.DeliverySettings.update(existingSettings.id, data);
      } else {
        return await base44.entities.DeliverySettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-settings'] });
      toast.success('Delivery settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        currentPage="AdminDeliverySettings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Delivery Settings</h1>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                Delivery Settings
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Configure radius-based delivery fees</p>
            </div>

          <div className="grid gap-6">
            {/* Free Delivery Zone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Free Delivery Zone
                </CardTitle>
                <CardDescription>
                  Set the radius and minimum order for free delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Free Delivery Radius (km)</Label>
                  <Input
                    type="number"
                    value={settings.free_delivery_radius_km}
                    onChange={(e) => setSettings({...settings, free_delivery_radius_km: parseFloat(e.target.value)})}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Customers within this radius get free delivery if order meets minimum
                  </p>
                </div>
                <div>
                  <Label>Minimum Order for Free Delivery (Rs.)</Label>
                  <Input
                    type="number"
                    value={settings.min_order_for_free_delivery}
                    onChange={(e) => setSettings({...settings, min_order_for_free_delivery: parseFloat(e.target.value)})}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Orders below this amount will be charged base delivery fee even within radius
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Charges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Delivery Charges
                </CardTitle>
                <CardDescription>
                  Configure fees for deliveries outside free zone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Delivery Fee (Rs.)</Label>
                  <Input
                    type="number"
                    value={settings.base_delivery_fee}
                    onChange={(e) => setSettings({...settings, base_delivery_fee: parseFloat(e.target.value)})}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Fixed charge for any delivery outside free radius
                  </p>
                </div>
                <div>
                  <Label>Per Kilometer Charge (Rs.)</Label>
                  <Input
                    type="number"
                    value={settings.per_km_charge}
                    onChange={(e) => setSettings({...settings, per_km_charge: parseFloat(e.target.value)})}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Additional charge per km beyond free delivery radius
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Example Calculation */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  Example Calculations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Within {settings.free_delivery_radius_km} km radius:</p>
                  <p className="text-sm text-gray-600">
                    • Order ≥ Rs. {settings.min_order_for_free_delivery}: <span className="font-bold text-emerald-600">FREE</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    • Order &lt; Rs. {settings.min_order_for_free_delivery}: <span className="font-bold text-orange-600">Rs. {settings.base_delivery_fee}</span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Outside free radius:</p>
                  <p className="text-sm text-gray-600">
                    • At 15 km (5 km extra): <span className="font-bold text-blue-600">Rs. {settings.base_delivery_fee + (5 * settings.per_km_charge)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    • At 20 km (10 km extra): <span className="font-bold text-blue-600">Rs. {settings.base_delivery_fee + (10 * settings.per_km_charge)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Formula: Base Fee + (Extra Distance × Per Km Charge)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}