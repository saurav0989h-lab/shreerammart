import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/ui/CartContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useCurrency } from '@/components/ui/CurrencyContext';
import { convertToUSD, formatCurrency, formatConvertedPrice } from '@/utils/currency';
import { ShoppingCart, Heart, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import QuickViewModal from './QuickViewModal';

export default function ProductCard3D({ product }) {
    const { addToCart } = useCart();
    const { language } = useLanguage();
    const { getSecondaryCurrencies, isIndianUser } = useCurrency();
    const [isHovered, setIsHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [showQuickView, setShowQuickView] = useState(false);

    const price = product.discount_price || product.base_price;
    const originalPrice = product.base_price;
    const priceUSD = convertToUSD(price);
    const discountPercentage = product.discount_price
        ? Math.round(((originalPrice - product.discount_price) / originalPrice) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        addToCart({
            product_id: product.id,
            product_name: product.name,
            ...product,
            quantity: 1
        });

        setIsAdded(true);
        toast.success(`${product.name} added to cart!`);

        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative preserve-3d h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`${createPageUrl('Products')}/${product.id}`} className="block h-full">
                <div className={`
          relative h-full bg-white rounded-2xl overflow-hidden
          border-2 border-gray-100 transition-all duration-500
          hover:shadow-2xl hover:-translate-y-3 hover:border-purple-200
          group/card
        `}>
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-3 left-3 z-20">
                            <div className="badge-sale shadow-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-sm">
                                -{discountPercentage}%
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className={`
            absolute top-3 right-3 z-20 flex flex-col gap-2
            transform transition-all duration-300
            ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}
          `}>
                        <Button size="icon" className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-md text-gray-700 hover:text-red-500 hover:bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                            <Heart className="w-5 h-5" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowQuickView(true);
                            }}
                            className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-md text-gray-700 hover:text-blue-500 hover:bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
                        >
                            <Eye className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 to-transparent z-10" />
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className={`
                w-full h-full object-cover transition-transform duration-700
                ${isHovered ? 'scale-125' : 'scale-100'}
              `}
                        />

                        {/* Quick Add Overlay */}
                        <div className={`
              absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20
              bg-gradient-to-t from-black/80 via-black/40 to-transparent
              flex justify-center transition-all duration-300
              ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}>
                            <Button
                                onClick={handleAddToCart}
                                className={`
                  w-full rounded-lg sm:rounded-xl font-bold shadow-xl transition-all duration-300 text-sm sm:text-base
                  ${isAdded ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-white hover:bg-purple-600 hover:text-white text-gray-900'}
                `}
                            >
                                {isAdded ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> Added!
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                        <div className="mb-2">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                {product.category_name}
                            </p>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover/card:text-transparent group-hover/card:bg-gradient-to-r group-hover/card:from-purple-600 group-hover/card:to-pink-600 group-hover/card:bg-clip-text transition-all">
                            {language === 'np' && product.name_np ? product.name_np : product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-lg sm:text-xl font-black text-gray-900">
                                {formatCurrency(price, 'NPR')}
                            </span>
                            {product.discount_price && (
                                <span className="text-xs sm:text-sm text-gray-400 line-through">
                                    {formatCurrency(originalPrice, 'NPR')}
                                </span>
                            )}
                        </div>

                        {/* Secondary Currency Display */}
                        {getSecondaryCurrencies().length > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                                {isIndianUser ? (
                                    <>
                                        <span className="text-blue-600 font-medium">
                                            ≈ {formatConvertedPrice(price, 'INR')}
                                        </span>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-green-600 font-medium">
                                            ≈ {formatConvertedPrice(price, 'USD')}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-green-600 font-medium">
                                        ≈ {formatConvertedPrice(price, 'USD')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <QuickViewModal
                isOpen={showQuickView}
                onClose={() => setShowQuickView(false)}
                product={product}
            />
        </motion.div>
    );
}
