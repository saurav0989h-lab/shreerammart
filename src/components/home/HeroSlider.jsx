import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function HeroSlider() {
  const { data: allBanners = [], isLoading } = useQuery({
    queryKey: ['promotion-banners', 'hero'],
    queryFn: () => base44.entities.PromotionBanner.list('display_order'),
  });

  // Filter active banners
  const activeBanners = allBanners.filter((banner) => {
    if (banner.is_active === false) return false;
    const now = new Date();
    if (banner.start_date && new Date(banner.start_date) > now) return false;
    if (banner.end_date && new Date(banner.end_date) < now) return false;
    return true;
  });

  // Default slide if no banners
  const defaultSlide = {
    id: 'default',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
    title: 'Welcome to ShreeRam SuperMart',
    description: 'Fresh groceries delivered to your doorstep',
    link_url: createPageUrl('Products'),
  };

  const slides = activeBanners.length > 0 ? activeBanners : [defaultSlide];

  if (isLoading) {
    return (
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[480px] bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[480px] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={slides.length > 1}
        speed={800}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image_url || defaultSlide.image_url})`,
              }}
            >
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-transparent backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

              {/* Content */}
              <div className="relative z-10 h-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center py-4 sm:py-6 md:py-8">
                <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-purple-200 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold uppercase tracking-widest mb-2 sm:mb-3 lg:mb-4 animate-fade-in">
                      ✨ {slide.subtitle}
                    </p>
                  )}

                  {/* Main Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-[1.1] animate-fade-in-up drop-shadow-2xl">
                    {slide.title || 'Fresh Groceries'}
                    {slide.highlight_text && (
                      <>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                          {slide.highlight_text}
                        </span>
                      </>
                    )}
                  </h1>

                  {/* Description */}
                  {slide.description && (
                    <p className="text-gray-100 text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-6 lg:mb-8 leading-relaxed font-medium animate-fade-in-up animation-delay-200 drop-shadow-lg hidden sm:block">
                      {slide.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  {slide.link_url && (
                    <div className="animate-fade-in-up animation-delay-400">
                      {slide.link_url.startsWith('http') ? (
                        <a
                          href={slide.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 font-bold group"
                          >
                            <span>{slide.button_text || 'Shop Now'}</span>
                            <span className="ml-2 group-hover:translate-x-1 transition-transform hidden sm:inline">→</span>
                          </Button>
                        </a>
                      ) : (
                        <Link to={slide.link_url}>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 font-bold group"
                          >
                            <span>{slide.button_text || 'Shop Now'}</span>
                            <span className="ml-2 group-hover:translate-x-1 transition-transform hidden sm:inline">→</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <div className="swiper-button-prev !w-8 sm:!w-10 md:!w-12 !h-8 sm:!h-10 md:!h-12 !bg-white/20 !backdrop-blur-md rounded-full after:!text-white !text-sm hover:!bg-white/40 transition-all" />
            <div className="swiper-button-next !w-8 sm:!w-10 md:!w-12 !h-8 sm:!h-10 md:!h-12 !bg-white/20 !backdrop-blur-md rounded-full after:!text-white !text-sm hover:!bg-white/40 transition-all" />
          </>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="swiper-pagination !bottom-3 sm:!bottom-4 md:!bottom-6 [&_.swiper-pagination-bullet]:!w-1.5 sm:[&_.swiper-pagination-bullet]:!w-2 md:[&_.swiper-pagination-bullet]:!w-3 [&_.swiper-pagination-bullet]:!h-1.5 sm:[&_.swiper-pagination-bullet]:!h-2 md:[&_.swiper-pagination-bullet]:!h-3 [&_.swiper-pagination-bullet]:!bg-white/60 [&_.swiper-pagination-bullet]:hover:!bg-white [&_.swiper-pagination-bullet-active]:!bg-white [&_.swiper-pagination-bullet-active]:!w-6 sm:[&_.swiper-pagination-bullet-active]:!w-7 md:[&_.swiper-pagination-bullet-active]:!w-10 transition-all" />
        )}
      </Swiper>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
