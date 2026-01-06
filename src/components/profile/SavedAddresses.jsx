import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Pencil, Trash2, Home, Building, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const municipalities = [
  'Ghorahi Sub-Metropolitan',
  'Tulsipur Sub-Metropolitan',
  'Lamahi Municipality',
  'Rapti Rural Municipality',
  'Dangisharan Rural Municipality',
  'Shantinagar Rural Municipality',
  'Rajpur Rural Municipality',
  'Gadhawa Rural Municipality',
  'Banglachuli Rural Municipality',
  'Babai Rural Municipality'
];

export default function SavedAddresses({ user, onUpdate }) {
  const [addresses, setAddresses] = useState(user?.saved_addresses || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: 'home',
    municipality: '',
    ward: '',
    area: '',
    landmark: '',
    is_default: false
  });

  const handleSave = async () => {
    if (!formData.municipality || !formData.area) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    let newAddresses;
    
    if (editingIndex !== null) {
      newAddresses = [...addresses];
      newAddresses[editingIndex] = formData;
    } else {
      newAddresses = [...addresses, formData];
    }

    // Set default logic
    if (formData.is_default) {
      newAddresses = newAddresses.map((addr, i) => ({
        ...addr,
        is_default: editingIndex !== null ? i === editingIndex : i === newAddresses.length - 1
      }));
    }

    await onUpdate({ saved_addresses: newAddresses });
    setAddresses(newAddresses);
    setSaving(false);
    setDialogOpen(false);
    resetForm();
    toast.success(editingIndex !== null ? 'Address updated' : 'Address added');
  };

  const handleDelete = async (index) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    await onUpdate({ saved_addresses: newAddresses });
    setAddresses(newAddresses);
    toast.success('Address deleted');
  };

  const handleEdit = (index) => {
    setFormData(addresses[index]);
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      label: 'home',
      municipality: '',
      ward: '',
      area: '',
      landmark: '',
      is_default: false
    });
    setEditingIndex(null);
  };

  const setAsDefault = async (index) => {
    const newAddresses = addresses.map((addr, i) => ({
      ...addr,
      is_default: i === index
    }));
    await onUpdate({ saved_addresses: newAddresses });
    setAddresses(newAddresses);
    toast.success('Default address updated');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Addresses</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIndex !== null ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Address Label</Label>
                <Select value={formData.label} onValueChange={(v) => setFormData({ ...formData, label: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home"><Home className="w-4 h-4 inline mr-2" /> Home</SelectItem>
                    <SelectItem value="office"><Building className="w-4 h-4 inline mr-2" /> Office</SelectItem>
                    <SelectItem value="other"><MapPin className="w-4 h-4 inline mr-2" /> Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Municipality *</Label>
                  <Select value={formData.municipality} onValueChange={(v) => setFormData({ ...formData, municipality: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ward No.</Label>
                  <Input
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="Ward No."
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Area / Tole *</Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Surkhet Road"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Landmark</Label>
                <Input
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near hospital, etc."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_default" className="cursor-pointer">Set as default address</Label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingIndex !== null ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No saved addresses yet</p>
            <p className="text-sm">Add an address for faster checkout</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address, index) => (
              <div key={index} className={`border rounded-xl p-4 relative ${address.is_default ? 'border-emerald-500 bg-emerald-50' : ''}`}>
                {address.is_default && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Default
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    address.label === 'home' ? 'bg-blue-100 text-blue-600' :
                    address.label === 'office' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {address.label === 'home' ? <Home className="w-5 h-5" /> :
                     address.label === 'office' ? <Building className="w-5 h-5" /> :
                     <MapPin className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{address.label}</p>
                    <p className="text-sm text-gray-600">
                      {address.area}{address.ward ? `, Ward ${address.ward}` : ''}
                    </p>
                    <p className="text-sm text-gray-500">{address.municipality}</p>
                    {address.landmark && (
                      <p className="text-xs text-gray-400 mt-1">Near: {address.landmark}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {!address.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => setAsDefault(index)} className="text-emerald-600">
                      Set Default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(index)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}