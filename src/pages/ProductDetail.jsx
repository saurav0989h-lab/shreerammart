import { useState, useEffect , useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useCurrency } from '@/components/ui/CurrencyContext';
import { useCart } from '@/components/ui/CartContext';
import { useWishlist } from '@/components/ui/WishlistContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ShoppingCart, Heart, Star, MessageSquare, Loader2, Upload, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatConvertedPrice } from '@/utils/currency';
import StarRating from '@/components/reviews/StarRating';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

export default function ProductDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const { t, language } = useLanguage();
  const { getSecondaryCurrencies, isIndianUser } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [customWeight, setCustomWeight] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('kg');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [cakeMessage, setCakeMessage] = useState('');
  const [cakePhotoUrl, setCakePhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ 
      product_id: productId, 
      is_approved: true 
    }),
    enabled: !!productId,
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const isWeightBased = ['kg', 'gram', 'liter', 'ml'].includes(product?.unit_type);
  const isLiterBased = ['liter', 'ml'].includes(product?.unit_type);
  const isCakeProduct = useMemo(() => {
    const name = (product?.name || '').toLowerCase();
    const category = (product?.category_name || '').toLowerCase();
    return name.includes('cake') || category.includes('cake') || (category.includes('bakery') && name.includes('cake'));
  }, [product]);

  const handleAddToCart = () => {
    const customizations = isCakeProduct ? {
      cake_message: cakeMessage?.trim() || null,
      cake_photo_url: cakePhotoUrl || null
    } : null;
    addToCart(product, quantity, false, customizations);
  };

  const handleCustomWeightAdd = () => {
    let weight = parseFloat(customWeight);
    if (weight && weight > 0) {
      // Convert to kg if product unit is kg but user selected gram
      if (product.unit_type === 'kg' && selectedUnit === 'gram') {
        weight = weight / 1000;
      }
      // Convert to gram if product unit is gram but user selected kg
      if (product.unit_type === 'gram' && selectedUnit === 'kg') {
        weight = weight * 1000;
      }
      // Convert to liter if product unit is liter but user selected ml/halfliter
      if (product.unit_type === 'liter') {
        if (selectedUnit === 'ml') {
          weight = weight / 1000;
        } else if (selectedUnit === 'halfliter') {
          weight = weight * 0.5;
        }
      }
      // Convert to ml if product unit is ml but user selected liter/halfliter
      if (product.unit_type === 'ml') {
        if (selectedUnit === 'liter') {
          weight = weight * 1000;
        } else if (selectedUnit === 'halfliter') {
          weight = weight * 500;
        }
      }
      const customizations = isCakeProduct ? {
        cake_message: cakeMessage?.trim() || null,
        cake_photo_url: cakePhotoUrl || null
      } : null;
      addToCart(product, weight, false, customizations);
      setCustomWeight('');
      setSelectedUnit(isLiterBased ? 'liter' : 'kg');
      setShowWeightInput(false);
    }
  };

  const handleCakePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const file = files[0];
    try {
      setUploadingPhoto(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCakePhotoUrl(file_url);
    } catch (err) {
      console.error('Photo upload failed', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    setShowReviewForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate(createPageUrl('Products'))}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const displayPrice = product.discount_price || product.base_price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Products'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('products')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={product.images?.[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-red-600 font-medium mb-2">{product.category_name}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'np' && product.name_np ? product.name_np : product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} size="lg" />
                  <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
                </div>
                <button
                  onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-gray-600 hover:text-red-600"
                >
                  ({reviews.length} {t('reviews')})
                </button>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-red-600">
                  {t('rs')} {displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    {t('rs')} {product.base_price.toLocaleString()}
                  </span>
                )}
                <span className="text-gray-500">/{product.unit_type}</span>
              </div>

              {/* Secondary Currency Display */}
              {getSecondaryCurrencies().length > 0 && (
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {isIndianUser ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                        <span className="text-xs text-blue-600 font-medium uppercase">INR</span>
                        <p className="text-lg font-bold text-blue-700">
                          ≈ {formatConvertedPrice(displayPrice, 'INR')}
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                        <span className="text-xs text-green-600 font-medium uppercase">USD</span>
                        <p className="text-lg font-bold text-green-700">
                          ≈ {formatConvertedPrice(displayPrice, 'USD')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                      <span className="text-xs text-green-600 font-medium uppercase">USD</span>
                      <p className="text-lg font-bold text-green-700">
                        ≈ {formatConvertedPrice(displayPrice, 'USD')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-700 mb-6">{product.description}</p>
            </div>

            {/* Cake Customization */}
            {isCakeProduct && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-3">Birthday Cake Options</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-amber-900 mb-1">Message on Cake (optional)</label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="Happy Birthday [Name]!"
                      value={cakeMessage}
                      onChange={(e) => setCakeMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    />
                    <p className="text-xs text-amber-700 mt-1">We recommend up to 30–40 characters.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-amber-900 mb-1">Add Photo on Cake (optional)</label>
                    {!cakePhotoUrl ? (
                      <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 text-center bg-amber-50/50">
                        <input
                          id="cake-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleCakePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                        <label htmlFor="cake-photo-upload" className="cursor-pointer inline-flex items-center gap-2 text-amber-800">
                          <Upload className="w-4 h-4" />
                          {uploadingPhoto ? 'Uploading...' : 'Click to upload photo'}
                        </label>
                        <p className="text-xs text-amber-700 mt-1">JPEG/PNG up to ~5MB works best.</p>
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <img src={cakePhotoUrl} alt="Cake" className="w-28 h-28 object-cover rounded-lg border border-amber-200" />
                        <button
                          type="button"
                          onClick={() => setCakePhotoUrl('')}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
                          aria-label="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {product.stock_quantity > 0 && (
              <div className="space-y-4 mb-6">
                {isWeightBased && !showWeightInput ? (
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-red-600 hover:bg-red-700 h-12"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" /> 1 {product.unit_type}
                    </Button>
                    <Button 
                      onClick={() => setShowWeightInput(true)}
                      variant="outline"
                      className="px-6 h-12 border-red-200 hover:bg-red-50"
                    >
                      {t('customAmount')}
                    </Button>
                  </div>
                ) : isWeightBased && showWeightInput ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={t('enterAmount')}
                        value={customWeight}
                        onChange={(e) => setCustomWeight(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      >
                        {isLiterBased ? (
                          <>
                            <option value="liter">{t('liter')}</option>
                            <option value="halfliter">{t('halfLiter')}</option>
                            <option value="ml">ML</option>
                          </>
                        ) : (
                          <>
                            <option value="kg">Kilogram</option>
                            <option value="gram">{t('gram')}</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleCustomWeightAdd}
                        className="flex-1 bg-red-600 hover:bg-red-700 h-12"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {t('addToCart')}
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowWeightInput(false);
                          setCustomWeight('');
                          setSelectedUnit(isLiterBased ? 'liter' : 'kg');
                        }}
                        variant="outline"
                        className="px-6 h-12"
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-red-600 hover:bg-red-700 h-12"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t('addToCart')}
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {product.stock_quantity <= 0 && (
                <Button
                  disabled
                  className="flex-1 h-12"
                >
                  {t('outOfStock')}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => toggleWishlist(product)}
                className="h-12 px-6"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="bg-white rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('customerReviews')}
              </h2>
              <div className="flex items-center gap-3">
                <StarRating rating={avgRating} size="lg" showNumber />
                <span className="text-gray-600">
                  {t('basedOn')} {reviews.length} {t('reviews')}
                </span>
              </div>
            </div>
            <Button onClick={handleWriteReview} className="bg-red-600 hover:bg-red-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('writeReview')}
            </Button>
          </div>

          <ReviewList productId={productId} />
        </div>
      </div>

      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg sm:text-xl">
              {t('writeReview')}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
            <ReviewForm
              product={product}
              user={user}
              onClose={() => setShowReviewForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}