import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/ui/CartContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { formatCurrency, convertToUSD } from '@/utils/currency';
import { toast } from 'sonner';

export default function QuickViewModal({ product, isOpen, onClose }) {
    const { addToCart } = useCart();
    const { t, language } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    if (!isOpen || !product) return null;

    const price = product.discount_price || product.base_price;
    const originalPrice = product.base_price;
    const priceUSD = convertToUSD(price);

    const handleAddToCart = () => {
        addToCart({
            product_id: product.id,
            product_name: product.name,
            ...product,
            quantity
        });

        setIsAdded(true);
        toast.success(`${product.name} added to cart!`);
        setTimeout(() => {
            setIsAdded(false);
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl preserve-3d">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            <div className="grid md:grid-cols-2">
                                {/* Image Section */}
                                <div className="relative h-64 md:h-auto bg-gray-50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent z-10" />
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {product.discount_price && (
                                        <div className="absolute top-4 left-4 z-20 badge-sale">
                                            Sale
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-6 md:p-8 lg:p-10 space-y-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                                            {language === 'np' && product.name_np ? product.name_np : product.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500 font-medium">(4.8/5)</span>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                                {formatCurrency(price, 'NPR')}
                                            </span>
                                            {product.discount_price && (
                                                <span className="text-lg text-gray-400 line-through">
                                                    {formatCurrency(originalPrice, 'NPR')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            ≈ {formatCurrency(priceUSD, 'USD')}
                                        </p>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed">
                                        {product.description || 'Premium quality fresh products sourced directly from local farmers in Dang.'}
                                    </p>

                                    <div className="space-y-4 pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900">Quantity</span>
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                onClick={handleAddToCart}
                                                className={`flex-1 h-12 text-base rounded-xl font-bold transition-all duration-300 ${isAdded
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : 'btn-primary'
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <span className="flex items-center gap-2">
                                                        <Check className="w-5 h-5" /> Added to Cart
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                                                    </span>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 w-12 rounded-xl border-2 hover:bg-gray-50 hover:border-red-200 hover:text-red-500 transition-colors"
                                            >
                                                <Heart className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
