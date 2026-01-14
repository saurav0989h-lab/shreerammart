import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/ui/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard3D from '../products/ProductCard3D';

export default function FeaturedProducts({ products = [] }) {
  const { t, language } = useLanguage();
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-transparent via-purple-50/30 to-pink-50/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-12 lg:mb-16 gap-6">
          <div className="flex-1">
            <p className="text-purple-600 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 sm:mb-3">
              ⭐ BESTSELLERS
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-4 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Featured Products
              </span>
            </h2>
            <p className="text-gray-600 font-medium text-sm sm:text-base lg:text-lg max-w-lg">
              {language === 'np' ? 'तपाईंको लागि छानिएका सामानहरू' : 'Handpicked items just for you'}
            </p>
          </div>
          <Link to={createPageUrl('Products')} className="hidden lg:block flex-shrink-0">
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl lg:rounded-2xl px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base group">
              View All <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.slice(0, 8).map((product, index) => (
            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard3D product={product} />
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 text-center lg:hidden">
          <Link to={createPageUrl('Products')}>
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold shadow-lg rounded-xl sm:rounded-2xl px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base group">
              View All {t('products')} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}