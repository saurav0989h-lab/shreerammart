import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';
import StarRating from './StarRating';
import { Check, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ReviewList({ productId }) {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ 
      product_id: productId, 
      is_approved: true 
    }, '-created_date'),
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {language === 'np' ? 'अहिलेसम्म कुनै समीक्षा छैन' : 'No reviews yet'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 pb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{review.user_name}</span>
                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3" />
                    {language === 'np' ? 'प्रमाणित' : 'Verified'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-gray-500">
                  {format(new Date(review.created_date), 'MMM d, yyyy')}
                </span>
              </div>
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
              )}
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
              
              {review.images?.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      onClick={() => setSelectedImage(img)}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  ))}
                </div>
              )}

              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {language === 'np' ? 'उपयोगी' : 'Helpful'} ({review.helpful_count || 0})
              </Button>
            </div>
          </div>
        </div>
      ))}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <img src={selectedImage} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}