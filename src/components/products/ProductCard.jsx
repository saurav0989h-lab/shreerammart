import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Check, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/ui/CartContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useWishlist } from '@/components/ui/WishlistContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { t, language } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showAdded, setShowAdded] = useState(false);
  const [customWeight, setCustomWeight] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('kg');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState('');

  const isLiterBased = ['liter', 'ml'].includes(product.unit_type);

  const cartItem = cart.find(item => item.product_id === product.id);
  const quantity = cartItem?.quantity || 0;

  const isWeightBased = ['kg', 'gram', 'liter', 'ml'].includes(product.unit_type);

  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const displayPrice = product.discount_price || product.base_price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.base_price) * 100) : 0;

  const { data: reviews = [] } = useQuery({
    queryKey: ['product-reviews', product.id],
    queryFn: () => base44.entities.Review.filter({
      product_id: product.id,
      is_approved: true
    }),
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
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
      addToCart(product, weight);
      setCustomWeight('');
      setSelectedUnit(isLiterBased ? 'liter' : 'kg');
      setShowWeightInput(false);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 1500);
    }
  };

  return (
    <motion.div
      className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-purple-200 hover:shadow-2xl transition-all duration-300"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.images?.[0] ? (
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart className="w-16 h-16" />
          </div>
        )}

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {hasDiscount && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg"
          >
            -{discountPercent}%
          </motion.div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"
        >
          <Heart
            className={`w-5 h-5 transition-all ${isInWishlist(product.id)
                ? 'fill-pink-500 text-pink-500'
                : 'text-gray-600'
              }`}
          />
        </button>

        {product.is_bulk_only && (
          <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg">
            Bulk Only
          </div>
        )}

        {product.stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-lg shadow-xl">{t('outOfStock')}</span>
          </div>
        )}

        {/* Quick view on hover */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-xs line-clamp-2">{product.description}</p>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
            {product.category_name}
          </span>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({reviews.length})</span>
            </div>
          )}
        </div>
        
        <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
          <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 min-h-[3rem] hover:text-purple-600 transition-colors leading-snug">
            {product.name_np && language === 'np' ? product.name_np : product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('rs')} {displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">{t('rs')} {product.base_price.toLocaleString()}</span>
          )}
          <span className="text-sm text-gray-500 font-medium">/{product.unit_type}</span>
        </div>

        {product.stock_quantity > 0 && (
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {isWeightBased && !showWeightInput ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl h-11 font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> 1 {product.unit_type}
                    </Button>
                    <Button
                      onClick={() => setShowWeightInput(true)}
                      variant="outline"
                      className="px-4 rounded-xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 font-semibold"
                    >
                      {language === 'np' ? 'मात्रा' : 'Custom'}
                    </Button>
                  </div>
                ) : isWeightBased && showWeightInput ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        min="1"
                        placeholder={language === 'np' ? 'मात्रा' : 'Amount'}
                        value={customWeight}
                        onChange={(e) => setCustomWeight(e.target.value)}
                        className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-20 px-2 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-medium"
                      >
                        {isLiterBased ? (
                          <>
                            <option value="liter">{language === 'np' ? 'लिटर' : 'liter'}</option>
                            <option value="halfliter">{language === 'np' ? 'आधा' : 'half L'}</option>
                            <option value="ml">ml</option>
                          </>
                        ) : (
                          <>
                            <option value="kg">kg</option>
                            <option value="gram">{language === 'np' ? 'ग्राम' : 'gram'}</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCustomWeightAdd}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl h-10 text-sm font-bold"
                      >
                        {language === 'np' ? 'थप्नुहोस्' : 'Add'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWeightInput(false);
                          setCustomWeight('');
                          setSelectedUnit('kg');
                        }}
                        variant="ghost"
                        className="px-4 rounded-xl h-10 text-sm hover:bg-gray-100 font-semibold"
                      >
                        {language === 'np' ? 'रद्द' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl h-11 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {showAdded ? (
                      <>
                        <Check className="w-5 h-5 mr-2" /> {language === 'np' ? 'थपियो' : 'Added!'}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" /> {t('addToCart')}
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="quantity"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-2"
              >
                {editingQuantity ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      autoFocus
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newQty = parseFloat(tempQuantity);
                          if (newQty > 0) {
                            updateQuantity(product.id, newQty);
                          } else {
                            updateQuantity(product.id, 0);
                          }
                          setEditingQuantity(false);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Button
                      onClick={() => {
                        const newQty = parseFloat(tempQuantity);
                        if (newQty > 0) {
                          updateQuantity(product.id, newQty);
                        } else {
                          updateQuantity(product.id, 0);
                        }
                        setEditingQuantity(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 rounded-lg h-10"
                    >
                      {language === 'np' ? 'ठीक' : 'OK'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-red-50 rounded-xl p-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1))}
                      className="h-9 w-9 rounded-lg hover:bg-red-100"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() => {
                        setTempQuantity(quantity.toString());
                        setEditingQuantity(true);
                      }}
                      className="font-semibold text-red-700 px-2 py-1 hover:bg-red-100 rounded transition-colors"
                    >
                      {quantity} {product.unit_type}
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="h-9 w-9 rounded-lg hover:bg-red-100"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {isWeightBased && !editingQuantity && !showWeightInput && (
                  <Button
                    onClick={() => {
                      setCustomWeight(quantity.toString());
                      if (isLiterBased) {
                        setSelectedUnit('liter');
                      } else {
                        setSelectedUnit('kg');
                      }
                      setShowWeightInput(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-red-200 hover:bg-red-50 text-xs"
                  >
                    {language === 'np' ? 'मात्रा परिवर्तन' : 'Change Amount'}
                  </Button>
                )}
                {isWeightBased && showWeightInput && !editingQuantity && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5 sm:gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={language === 'np' ? 'मात्रा' : 'Amount'}
                        value={customWeight}
                        onChange={(e) => setCustomWeight(e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="min-w-[70px] sm:w-auto px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      >
                        {isLiterBased ? (
                          <>
                            <option value="liter">{language === 'np' ? 'लिटर' : 'liter'}</option>
                            <option value="halfliter">{language === 'np' ? 'आधा' : 'half L'}</option>
                            <option value="ml">ml</option>
                          </>
                        ) : (
                          <>
                            <option value="kg">kg</option>
                            <option value="gram">{language === 'np' ? 'ग्राम' : 'gram'}</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        onClick={() => {
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
                            updateQuantity(product.id, weight);
                            setCustomWeight('');
                            setSelectedUnit(isLiterBased ? 'liter' : 'kg');
                            setShowWeightInput(false);
                          }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        {language === 'np' ? 'अद्यावधिक' : 'Update'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWeightInput(false);
                          setCustomWeight('');
                          setSelectedUnit('kg');
                        }}
                        variant="ghost"
                        className="px-2 sm:px-3 rounded-lg h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        {language === 'np' ? 'रद्द' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}