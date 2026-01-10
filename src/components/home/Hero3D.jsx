import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Clock, Truck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useHeroPromotionConfig } from '@/hooks/useHeroPromotionConfig';
import { base44 } from '@/api/base44Client';

const DEFAULT_SLIDE_INTERVAL = 7000;
const MIN_SLIDE_INTERVAL = 3000;

export default function Hero3D() {
    const { t } = useLanguage();
    const { config } = useHeroPromotionConfig();
    const [currentIndex, setCurrentIndex] = useState(0);

    const { data: allBanners = [], isLoading: loadingBanners } = useQuery({
        queryKey: ['promotion-banners', 'hero'],
        queryFn: () => base44.entities.PromotionBanner.list('display_order'),
    });

    const firstDurationMs = Math.max(3000, (config.firstSlideDuration ?? 10) * 1000);
    const normalDurationMs = Math.max(3000, (config.normalSlideDuration ?? 6) * 1000);

    const featureCards = config.featureCards || [];

    const features = useMemo(() => ([
        { icon: Sparkles, text: config.feature1Text, subtext: config.feature1Subtext },
        { icon: Clock, text: config.feature2Text, subtext: config.feature2Subtext },
        { icon: Truck, text: config.feature3Text, subtext: config.feature3Subtext },
    ]), [config.feature1Subtext, config.feature1Text, config.feature2Subtext, config.feature2Text, config.feature3Subtext, config.feature3Text]);

    const activeBanners = useMemo(() => {
        const now = new Date();
        return allBanners
            .filter((banner) => {
                if (banner.is_active === false) return false;
                if (banner.start_date && new Date(banner.start_date) > now) return false;
                if (banner.end_date && new Date(banner.end_date) < now) return false;
                return true;
            })
            .sort((a, b) => {
                const orderA = Number(a.display_order ?? 0);
                const orderB = Number(b.display_order ?? 0);
                if (orderA === orderB) {
                    return new Date(a.created_date || 0) - new Date(b.created_date || 0);
                }
                return orderA - orderB;
            });
    }, [allBanners]);

    const slides = useMemo(() => {
        if (activeBanners.length > 0) {
            return activeBanners.map((banner, index) => {
                const displayDurationSeconds = Number(banner.display_duration);
                const durationMs = Number.isFinite(displayDurationSeconds) && displayDurationSeconds > 0
                    ? displayDurationSeconds * 1000
                    : normalDurationMs;

                return {
                    id: banner.id,
                    title: banner.title || config.title,
                    highlightText: config.highlightText,
                    description: banner.description || config.description,
                    image: banner.image_url || config.backgroundImage,
                    linkUrl: banner.link_url || createPageUrl('Products'),
                    durationMs,
                };
            });
        }

        return [{
            id: 'default-hero-slide',
            title: config.title,
            highlightText: config.highlightText,
            description: config.description,
            image: config.backgroundImage,
            linkUrl: createPageUrl('Products'),
            durationMs: normalDurationMs,
        }];
    }, [activeBanners, config.backgroundImage, config.description, config.highlightText, config.title, normalDurationMs]);

    useEffect(() => {
        if (slides.length <= 1) return undefined;

        const currentSlide = slides[currentIndex];
        const duration = currentIndex === 0
            ? firstDurationMs
            : Math.max(MIN_SLIDE_INTERVAL, currentSlide?.durationMs ?? normalDurationMs);

        const timer = window.setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, duration);

        return () => window.clearTimeout(timer);
    }, [slides, currentIndex, firstDurationMs, normalDurationMs]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentIndex((index + slides.length) % slides.length);
    };

    const handlePrev = () => goToSlide(currentIndex - 1);
    const handleNext = () => goToSlide(currentIndex + 1);

    const currentSlide = slides[currentIndex];

    const renderFeatureCard = (card, index) => {
        const hasImage = Boolean(card?.image);
        return (
            <motion.div
                key={card?.id || index}
                className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-3xl shadow-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <div className="relative overflow-hidden">
                    {hasImage ? (
                        <img
                            src={card.image}
                            alt={card.title || 'Homepage highlight'}
                            className="w-full h-40 object-cover"
                        />
                    ) : (
                        <div className="w-full h-40 flex items-center justify-center text-sm text-gray-500 bg-purple-100/40">Image coming soon</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-4">
                    <p className="font-bold text-gray-900 text-lg">{card.title || 'Featured Category'}</p>
                    <p className="text-sm font-semibold text-purple-600">{card.subtitle || 'Update this card in admin panel'}</p>
                </div>
            </motion.div>
        );
    };

    return (
        <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-10 sm:py-14 lg:py-20 space-y-10">
                <div className="grid lg:grid-cols-[2fr,1fr] gap-6 lg:gap-10 items-stretch">
                    <div className="relative">
                        <div className="relative h-[380px] sm:h-[440px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-white/40">
                            {loadingBanners && !currentSlide ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                </div>
                            ) : null}
                            <AnimatePresence mode="wait">
                                {currentSlide ? (
                                    <motion.div
                                        key={currentSlide.id}
                                        initial={{ opacity: 0, scale: 1.02 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src={currentSlide.image}
                                            alt={currentSlide.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/20" />
                                        <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold uppercase tracking-wide">
                                                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 animate-pulse" />
                                                    {config.badge}
                                                </div>
                                                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight">
                                                    {currentSlide.title}
                                                    <br />
                                                    <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-200 bg-clip-text text-transparent">
                                                        {currentSlide.highlightText}
                                                    </span>
                                                </h1>
                                                <p className="text-sm sm:text-lg lg:text-xl text-white/85 max-w-2xl">
                                                    {currentSlide.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                                {(() => {
                                                    const ctaLabel = t('shopNow');
                                                    const url = currentSlide.linkUrl || createPageUrl('Products');
                                                    const isExternal = /^https?:\/\//i.test(url);

                                                    const button = (
                                                        <Button
                                                            size="lg"
                                                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                                                        >
                                                            {ctaLabel} →
                                                        </Button>
                                                    );

                                                    if (isExternal) {
                                                        return (
                                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                                {button}
                                                            </a>
                                                        );
                                                    }

                                                    return (
                                                        <Link to={url}>
                                                            {button}
                                                        </Link>
                                                    );
                                                })()}
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-sm">
                                                    <Sparkles className="w-4 h-4" />
                                                    {config.feature1Text}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            {slides.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/75 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                                        aria-label="Previous promotion"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/75 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                                        aria-label="Next promotion"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-800" />
                                    </button>
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                        {slides.map((slide, index) => (
                                            <button
                                                key={slide.id}
                                                type="button"
                                                onClick={() => goToSlide(index)}
                                                className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'}`}
                                                aria-label={`Go to slide ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {featureCards.length > 0 ? (
                        <div className="hidden lg:flex flex-col gap-4">
                            {featureCards.slice(0, 3).map((card, index) => renderFeatureCard(card, index))}
                        </div>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center gap-3 px-4 py-5 bg-white/80 backdrop-blur-sm border border-white rounded-2xl shadow-lg"
                            whileHover={{ y: -4 }}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center text-purple-600">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900">{feature.text}</p>
                                <p className="text-xs font-medium text-gray-600">{feature.subtext}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
