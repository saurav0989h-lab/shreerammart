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
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[650px] bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[650px]">
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
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

              {/* Content */}
              <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-purple-300 text-sm sm:text-base lg:text-lg font-semibold uppercase tracking-wider mb-2 sm:mb-3 lg:mb-4 animate-fade-in">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 lg:mb-8 leading-tight animate-fade-in-up">
                    {slide.title || 'Fresh Groceries'}
                    {slide.highlight_text && (
                      <>
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                          {slide.highlight_text}
                        </span>
                      </>
                    )}
                  </h1>

                  {/* Description */}
                  {slide.description && (
                    <p className="text-white/90 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
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
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-8 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-bold"
                          >
                            {slide.button_text || 'Shop Now'} →
                          </Button>
                        </a>
                      ) : (
                        <Link to={slide.link_url}>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-8 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-bold"
                          >
                            {slide.button_text || 'Shop Now'} →
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
            <div className="swiper-button-prev !w-12 !h-12 !bg-white/20 !backdrop-blur-sm rounded-full after:!text-white !text-base hover:!bg-white/30 transition-all" />
            <div className="swiper-button-next !w-12 !h-12 !bg-white/20 !backdrop-blur-sm rounded-full after:!text-white !text-base hover:!bg-white/30 transition-all" />
          </>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="swiper-pagination !bottom-8 [&_.swiper-pagination-bullet]:!w-3 [&_.swiper-pagination-bullet]:!h-3 [&_.swiper-pagination-bullet]:!bg-white [&_.swiper-pagination-bullet-active]:!bg-purple-500 [&_.swiper-pagination-bullet-active]:!w-8" />
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
            transform: translateY(20px);
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
