import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, X, User, Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileInfo({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    alt_phone: user?.alt_phone || ''
  });

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(formData);
    setSaving(false);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      alt_phone: user?.alt_phone || ''
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-500">
              <User className="w-4 h-4" /> Full Name
            </Label>
            {isEditing ? (
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="h-11"
              />
            ) : (
              <p className="text-lg font-medium">{user?.full_name || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-500">
              <Mail className="w-4 h-4" /> Email Address
            </Label>
            <p className="text-lg font-medium">{user?.email || '-'}</p>
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-500">
              <Phone className="w-4 h-4" /> Phone Number
            </Label>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="98XXXXXXXX"
                className="h-11"
              />
            ) : (
              <p className="text-lg font-medium">{user?.phone || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-500">
              <Phone className="w-4 h-4" /> Alternative Phone
            </Label>
            {isEditing ? (
              <Input
                value={formData.alt_phone}
                onChange={(e) => setFormData({ ...formData, alt_phone: e.target.value })}
                placeholder="Optional"
                className="h-11"
              />
            ) : (
              <p className="text-lg font-medium">{user?.alt_phone || '-'}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">
            Member since: {user?.created_date ? new Date(user.created_date).toLocaleDateString('en-US', { dateStyle: 'long' }) : '-'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}