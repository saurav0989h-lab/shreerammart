import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Menu, Plus, Pencil, Trash2, MapPin, Phone, Clock, ExternalLink, Loader2, Store } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';

const categoryTypes = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'dairy_sweets', label: 'Dairy & Sweets' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'dairy_products', label: 'Dairy Products' },
  { value: 'all', label: 'All Categories' },
];

export default function AdminStores() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_type: 'all',
    address: '',
    phone: '',
    opening_hours: '',
    google_maps_url: '',
    latitude: '',
    longitude: '',
    is_active: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    };
    checkAuth();
  }, [navigate]);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => base44.entities.ShopLocation.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ShopLocation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Store created');
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShopLocation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Store updated');
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShopLocation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Store deleted');
    }
  });

  const openDialog = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name || '',
        category_type: store.category_type || 'all',
        address: store.address || '',
        phone: store.phone || '',
        opening_hours: store.opening_hours || '',
        google_maps_url: store.google_maps_url || '',
        latitude: store.latitude || '',
        longitude: store.longitude || '',
        is_active: store.is_active !== false
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        category_type: 'all',
        address: '',
        phone: '',
        opening_hours: '',
        google_maps_url: '',
        latitude: '',
        longitude: '',
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingStore(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null
    };

    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleActive = (store) => {
    updateMutation.mutate({ 
      id: store.id, 
      data: { is_active: !store.is_active } 
    });
  };

  const getGoogleMapsUrl = (store) => {
    if (store.google_maps_url) return store.google_maps_url;
    if (store.latitude && store.longitude) {
      return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + ', Dang, Nepal')}`;
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Store Locations</h1>
                <p className="text-gray-500">Manage your store addresses and Google Maps links</p>
              </div>
            </div>
            <Button onClick={() => openDialog()} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Add Store
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : stores.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No stores added yet</p>
                <Button onClick={() => openDialog()} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  Add Your First Store
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(store => (
                <Card key={store.id} className={!store.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{store.name}</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full capitalize">
                          {store.category_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <Switch 
                        checked={store.is_active}
                        onCheckedChange={() => toggleActive(store)}
                      />
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                        {store.address}
                      </p>
                      {store.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {store.phone}
                        </p>
                      )}
                      {store.opening_hours && (
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {store.opening_hours}
                        </p>
                      )}
                    </div>

                    <a 
                      href={getGoogleMapsUrl(store)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 mb-4"
                    >
                      <ExternalLink className="w-3 h-3" /> View on Google Maps
                    </a>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm" onClick={() => openDialog(store)} className="flex-1">
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(store.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStore ? 'Edit Store' : 'Add New Store'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Store Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Main Bazaar Shop"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category Type</Label>
              <Select value={formData.category_type} onValueChange={(v) => setFormData({ ...formData, category_type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Main Road, Ghorahi"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+977-98XXXXXXXX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Opening Hours</Label>
                <Input
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  placeholder="7:00 AM - 8:00 PM"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-emerald-600 font-medium">Google Maps Integration</Label>
              <p className="text-xs text-gray-500 mb-3">Add a direct link or coordinates for directions</p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Google Maps URL</Label>
                  <Input
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="mt-1"
                  />
                </div>

                <p className="text-xs text-gray-400 text-center">— OR use coordinates —</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="28.0555"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="82.4883"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>Store is active</Label>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name || !formData.address || createMutation.isPending || updateMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingStore ? 'Update Store' : 'Add Store'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}