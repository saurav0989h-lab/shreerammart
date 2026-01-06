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
    <section className="py-8 sm:py-12 lg:py-20 bg-gradient-to-b from-pink-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center mb-6 sm:mb-10 lg:mb-16">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-1 sm:mb-2 lg:mb-3">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                {language === 'np' ? 'विशेष उत्पादनहरू' : 'Featured Products'}
              </span>
            </h2>
            <p className="text-gray-700 font-medium text-xs sm:text-sm lg:text-lg">
              {language === 'np' ? 'तपाईंको लागि छानिएका सामानहरू ⭐' : 'Handpicked items just for you ⭐'}
            </p>
          </div>
          <Link to={createPageUrl('Products')} className="hidden lg:block">
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl lg:rounded-2xl px-4 lg:px-8 text-xs lg:text-base">
              {t('viewAll')} →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.slice(0, 8).map(product => (
            <ProductCard3D key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 sm:mt-8 text-center lg:hidden">
          <Link to={createPageUrl('Products')}>
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold shadow-xl rounded-xl sm:rounded-2xl px-6 sm:px-8 text-sm sm:text-base">
              {t('viewAll')} {t('products')} →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}