import { Gift, Heart, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function GiftOrderForm({ formData, onChange, isInternationalOrder, onToggleInternational, isGift, onToggleGift }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      {/* International Order Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Ordering from Outside Nepal?</h2>
          </div>
          <Switch checked={isInternationalOrder} onCheckedChange={onToggleInternational} />
        </div>
        {isInternationalOrder && (
          <p className="text-sm text-gray-600 mt-2 ml-7">
            Order from India or abroad and we'll deliver to your family in Nepal
          </p>
        )}
      </div>

      {/* Gift Option - Always visible */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-gray-900">Send as Gift?</h3>
          </div>
          <Switch checked={isGift} onCheckedChange={onToggleGift} />
        </div>

        {isGift && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Add a special message for your loved ones
            </p>
            <div>
              <Label>Gift Message</Label>
              <Textarea
                placeholder="Write a message for your loved one..."
                value={formData.gift_message || ''}
                onChange={(e) => onChange('gift_message', e.target.value)}
                className="mt-1 rounded-xl"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sender Info for International Orders */}
      {isInternationalOrder && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-gray-900">Your Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Your Name *</Label>
              <Input
                placeholder="Your full name"
                value={formData.sender_name || ''}
                onChange={(e) => onChange('sender_name', e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label>Your Phone (with country code)</Label>
              <Input
                placeholder="+91 XXX XXX XXXX"
                value={formData.sender_phone || ''}
                onChange={(e) => onChange('sender_phone', e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Your Email *</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.sender_email || ''}
                onChange={(e) => onChange('sender_email', e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-1">We'll send order updates to this email</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}