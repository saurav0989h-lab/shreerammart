import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHeroPromotionConfig } from '@/hooks/useHeroPromotionConfig';

export default function PromotionBanners() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { config } = useHeroPromotionConfig();
  const DEFAULT_DURATION = Math.max(3000, (config.normalSlideDuration ?? 6) * 1000);
  const FIRST_DURATION = Math.max(3000, (config.firstSlideDuration ?? 10) * 1000);
  const MIN_DURATION = 3000;

  // Fetch active promotion banners
  const { data: allBanners = [] } = useQuery({
    queryKey: ['promotion-banners'],
    queryFn: () => base44.entities.PromotionBanner.list('display_order'),
  });

  // Filter active banners and check date ranges
  const banners = allBanners.filter(banner => {
    if (!banner.is_active) return false;
    
    const now = new Date();
    
    // Check if banner has started (if start_date is set)
    if (banner.start_date && new Date(banner.start_date) > now) {
      return false;
    }
    
    // Check if banner has expired (if end_date is set)
    if (banner.end_date && new Date(banner.end_date) < now) {
      return false;
    }
    
    return true;
  });

  // Auto-advance carousel
  useEffect(() => {
    if (currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;

    const currentBanner = banners[currentIndex];
    const durationSeconds = Number(currentBanner?.display_duration) || 0;
    const baseDuration = currentIndex === 0 ? FIRST_DURATION : DEFAULT_DURATION;
    const durationMs = Math.max(
      MIN_DURATION,
      durationSeconds > 0 ? durationSeconds * 1000 : baseDuration
    );

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [banners, currentIndex, DEFAULT_DURATION, FIRST_DURATION]);

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <section className="py-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          {/* Carousel Container */}
          <div className="relative aspect-[21/9] md:aspect-[21/6]">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={false}
                animate={{
                  opacity: index === currentIndex ? 1 : 0,
                  scale: index === currentIndex ? 1 : 0.95,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 ${index === currentIndex ? 'z-10' : 'z-0'}`}
              >
                {banner.link_url ? (
                  <Link to={banner.link_url} className="block w-full h-full">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          {banner.title && (
                            <h3 className="text-2xl md:text-4xl font-bold mb-2">
                              {banner.title}
                            </h3>
                          )}
                          {banner.description && (
                            <p className="text-sm md:text-lg opacity-90">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="w-full h-full">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          {banner.title && (
                            <h3 className="text-2xl md:text-4xl font-bold mb-2">
                              {banner.title}
                            </h3>
                          )}
                          {banner.description && (
                            <p className="text-sm md:text-lg opacity-90">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
