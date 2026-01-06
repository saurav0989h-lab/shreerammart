import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/ui/LanguageContext';
import { MapPin, Truck, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[650px] bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/85 to-white/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80"
          alt="Fresh groceries"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-3 sm:mb-4 lg:mb-6 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-full border-2 border-white shadow-lg">
                <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent text-xs sm:text-sm font-bold">🎉 {t('servingDang')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-3 sm:mb-4 lg:mb-6 leading-tight">
                {t('heroTitle')}<br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient">
                  {t('heroSubtitle')}
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-700 mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-medium">
                {t('heroDescription')}
              </p>
              
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link to={createPageUrl('Products')}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-7 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-bold">
                    {t('shopNow')} →
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="mt-6 sm:mt-10 lg:mt-14 grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <motion.div 
                  className="text-center p-2 sm:p-3 lg:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-base sm:text-lg lg:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">FREE</div>
                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-700 mt-1 sm:mt-2 font-semibold leading-tight">Delivery over Rs. 500</div>
                </motion.div>
                <motion.div 
                  className="text-center p-2 sm:p-3 lg:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-base sm:text-lg lg:text-2xl font-black bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">SAME DAY</div>
                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-700 mt-1 sm:mt-2 font-semibold leading-tight">Fast Delivery</div>
                </motion.div>
                <motion.div 
                  className="text-center p-2 sm:p-3 lg:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-base sm:text-lg lg:text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">COD</div>
                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-700 mt-1 sm:mt-2 font-semibold leading-tight">Payment Available</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Product Images */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <motion.div 
                  className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-4 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 border-2 border-purple-100"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-3 group">
                    <img
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
                      alt="Fresh vegetables"
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg">Fresh Vegetables</p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Daily Fresh Stock ✨</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-4 shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 border-2 border-orange-100"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-3 group">
                    <img
                      src="https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80"
                      alt="Bakery items"
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="font-bold text-gray-900">Fresh Bakery</p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Daily Baked 🥐</p>
                </motion.div>
              </div>
              <div className="space-y-4 mt-8">
                <motion.div 
                  className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-4 shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 border-2 border-pink-100"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-3 group">
                    <img
                      src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80"
                      alt="Dairy products"
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="font-bold text-gray-900">Dairy Products</p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Fresh & Pure 🥛</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-white to-red-50 rounded-3xl p-4 shadow-2xl hover:shadow-red-500/30 transition-all duration-300 border-2 border-red-100"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-3 group">
                    <img
                      src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80"
                      alt="Groceries"
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg">Groceries</p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Best Quality 🛒</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}