import { useWishlist } from '@/components/ui/WishlistContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/ui/CartContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();

  const handleAddToCart = (item) => {
    const product = {
      id: item.product_id,
      name: item.product_name,
      images: [item.product_image],
      base_price: item.product_price,
      discount_price: item.product_price
    };
    addToCart(product, 1);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-red-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'np' ? 'तपाईंको विशलिस्ट खाली छ' : 'Your wishlist is empty'}
        </h3>
        <p className="text-gray-500 mb-6">
          {language === 'np' ? 'उत्पादनहरू सेभ गर्न सुरु गर्नुहोस्' : 'Start saving products you love'}
        </p>
        <Link to={createPageUrl('Products')}>
          <Button className="bg-red-600 hover:bg-red-700">
            {language === 'np' ? 'किनमेल सुरु गर्नुहोस्' : 'Start Shopping'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'np' ? 'मेरो विशलिस्ट' : 'My Wishlist'}
        </h2>
        <span className="text-sm text-gray-500">
          {wishlistItems.length} {language === 'np' ? 'वस्तुहरू' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
            <div className="relative aspect-square bg-gray-50">
              {item.product_image ? (
                <img 
                  src={item.product_image} 
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <button
                onClick={() => {
                  const product = { id: item.product_id };
                  toggleWishlist(product);
                }}
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.product_name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {t('rs')} {item.product_price?.toLocaleString()}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  className="bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {language === 'np' ? 'कार्टमा' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}