import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/ui/CartContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { convertToUSD, formatCurrency } from '@/utils/currency';
import { ShoppingCart, Heart, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import QuickViewModal from './QuickViewModal';

export default function ProductCard3D({ product }) {
    const { addToCart } = useCart();
    const { language } = useLanguage();
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
          relative h-full bg-white rounded-3xl overflow-hidden
          border border-gray-100 transition-all duration-500
          hover:shadow-shadow-3d-lg hover:-translate-y-2
        `}>
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="badge-sale shadow-lg">
                                -{discountPercentage}%
                            </span>
                        </div>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className={`
            absolute top-4 right-4 z-20 flex flex-col gap-2
            transform transition-all duration-300
            ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
          `}>
                        <Button size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:text-red-500 hover:bg-white shadow-lg">
                            <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowQuickView(true);
                            }}
                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:text-blue-500 hover:bg-white shadow-lg"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 to-transparent z-10" />
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className={`
                w-full h-full object-cover transition-transform duration-700
                ${isHovered ? 'scale-110' : 'scale-100'}
              `}
                        />

                        {/* Quick Add Overlay */}
                        <div className={`
              absolute bottom-0 left-0 right-0 p-4 z-20
              bg-gradient-to-t from-black/60 to-transparent
              flex justify-center transition-all duration-300
              ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}>
                            <Button
                                onClick={handleAddToCart}
                                className={`
                  w-full rounded-xl font-bold shadow-lg transition-all duration-300
                  ${isAdded ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:bg-gray-50 text-gray-900'}
                `}
                            >
                                {isAdded ? (
                                    <span className="flex items-center gap-2">
                                        <Check className="w-4 h-4" /> Added
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                        <div className="mb-2">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                {product.category_name}
                            </p>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {language === 'np' && product.name_np ? product.name_np : product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(price, 'NPR')}
                            </span>
                            {product.discount_price && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(originalPrice, 'NPR')}
                                </span>
                            )}
                        </div>

                        {/* USD Price (Subtle) */}
                        <p className="text-xs text-gray-400 font-medium">
                            ≈ {formatCurrency(priceUSD, 'USD')}
                        </p>
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
