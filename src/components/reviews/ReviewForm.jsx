import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/components/ui/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StarRating from './StarRating';
import { Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewForm({ product, user, onClose }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const createReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-rating'] });
      toast.success(language === 'np' ? 'समीक्षा पोस्ट गरियो' : 'Review posted successfully');
      onClose();
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error(language === 'np' ? 'अधिकतम 5 तस्बिर' : 'Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });
      const urls = await Promise.all(uploadPromises);
      setImages([...images, ...urls]);
    } catch (error) {
      toast.error(language === 'np' ? 'अपलोड असफल' : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error(language === 'np' ? 'समीक्षा लेख्नुहोस्' : 'Please write a review');
      return;
    }

    createReviewMutation.mutate({
      product_id: product.id,
      product_name: product.name,
      user_email: user.email,
      user_name: user.full_name,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images,
      is_verified_purchase: false, // Could check order history
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'np' ? 'तपाईंको रेटिंग' : 'Your Rating'}
        </label>
        <StarRating rating={rating} size="xl" interactive onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'np' ? 'शीर्षक' : 'Title'} ({language === 'np' ? 'वैकल्पिक' : 'Optional'})
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={language === 'np' ? 'छोटो सारांश' : 'Brief summary'}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'np' ? 'समीक्षा' : 'Review'} *
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={language === 'np' ? 'तपाईंको अनुभव साझा गर्नुहोस्' : 'Share your experience'}
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'np' ? 'तस्बिरहरू' : 'Photos'} ({language === 'np' ? 'वैकल्पिक' : 'Optional'})
        </label>
        <div className="flex flex-wrap gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          {language === 'np' ? 'रद्द' : 'Cancel'}
        </Button>
        <Button
          type="submit"
          disabled={createReviewMutation.isPending}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          {createReviewMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : language === 'np' ? 'पोस्ट गर्नुहोस्' : 'Post Review'}
        </Button>
      </div>
    </form>
  );
}