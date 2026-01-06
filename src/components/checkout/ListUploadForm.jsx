import { useState , useEffect } from 'react';
import { Upload, FileText, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ListUploadForm({ onListSubmit, onPhotosSubmit }) {
  const [listText, setListText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill user data if logged in
  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      if (user) {
        setCustomerInfo({
          name: user.full_name || user.first_name + ' ' + user.last_name,
          phone: user.phone || '',
          email: user.email || ''
        });
      }
    };
    loadUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(url => url !== null);
    setPhotos(prev => [...prev, ...validUrls]);
    setUploading(false);
    toast.success(`${validUrls.length} photo(s) uploaded`);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }

    if (!listText.trim() && photos.length === 0) {
      toast.error('Please provide a list or upload photos');
      return;
    }

    setSubmitting(true);
    try {
      // Get current user again to ensure we have the ID
      const user = await base44.auth.me();

      await base44.entities.ShoppingList.create({
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        user_id: user?.id || null, // Link to user account
        list_text: listText,
        list_photos: photos,
        status: 'pending'
      });

      toast.success('List submitted! We will contact you when it\'s ready.');
      setListText('');
      setPhotos([]);
      setCustomerInfo({ name: '', phone: '', email: '' });
    } catch (error) {
      toast.error('Failed to submit list. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-500" />
        Upload Your Shopping List
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Your Name *</Label>
          <input
            type="text"
            placeholder="Enter your name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <Label>Phone Number *</Label>
          <input
            type="tel"
            placeholder="98XXXXXXXX"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label>Email (Optional)</Label>
          <input
            type="email"
            placeholder="your@email.com"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <Label>Write Your List</Label>
        <Textarea
          placeholder="Write your shopping list here, e.g.:&#10;&#10;Rice - 5 kg&#10;Milk - 2 liters&#10;Vegetables - 3 kg"
          value={listText}
          onChange={(e) => setListText(e.target.value)}
          className="mt-1 rounded-xl"
          rows={6}
        />
      </div>

      <div>
        <Label>Or Upload Photos of Your List</Label>
        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            id="list-photo-upload"
            disabled={uploading}
          />
          <label htmlFor="list-photo-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-700 font-medium mb-1">
              {uploading ? 'Uploading...' : 'Click to upload photos'}
            </p>
            <p className="text-sm text-gray-500">Upload images of your shopping list</p>
          </label>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`List ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || (!listText.trim() && photos.length === 0) || !customerInfo.name || !customerInfo.phone}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Shopping List'}
      </Button>
    </div>
  );
}