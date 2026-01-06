import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Truck, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useHeroPromotionConfig } from '@/hooks/useHeroPromotionConfig';

export default function Hero3D() {
    const { t } = useLanguage();
    const { config } = useHeroPromotionConfig();

    const featureCards = config.featureCards || [];

    const features = [
        { icon: Sparkles, text: config.feature1Text, subtext: config.feature1Subtext },
        { icon: Clock, text: config.feature2Text, subtext: config.feature2Subtext },
        { icon: Truck, text: config.feature3Text, subtext: config.feature3Subtext }
    ];

    const cardStyles = [
        {
            wrapperClass: 'bg-gradient-to-br from-white to-purple-50 rounded-3xl p-4 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 border-2 border-purple-100',
            hoverRotate: 2,
            imageHeight: 'h-48',
            subtitleGradient: 'from-purple-600 to-pink-600',
        },
        {
            wrapperClass: 'bg-gradient-to-br from-white to-orange-50 rounded-3xl p-4 shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 border-2 border-orange-100',
            hoverRotate: -2,
            imageHeight: 'h-32',
            subtitleGradient: 'from-orange-600 to-red-600',
        },
        {
            wrapperClass: 'bg-gradient-to-br from-white to-pink-50 rounded-3xl p-4 shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 border-2 border-pink-100',
            hoverRotate: -2,
            imageHeight: 'h-32',
            subtitleGradient: 'from-pink-600 to-purple-600',
        },
        {
            wrapperClass: 'bg-gradient-to-br from-white to-green-50 rounded-3xl p-4 shadow-2xl hover:shadow-green-500/30 transition-all duration-300 border-2 border-green-100',
            hoverRotate: 2,
            imageHeight: 'h-48',
            subtitleGradient: 'from-green-600 to-emerald-600',
        },
    ];

    const renderFeatureCard = (card, index) => {
        const style = cardStyles[index] || cardStyles[0];
        const hasImage = Boolean(card?.image);

        return (
            <motion.div
                key={card?.id || index}
                className={style.wrapperClass}
                whileHover={{ scale: 1.05, rotate: style.hoverRotate }}
            >
                <div className="relative overflow-hidden rounded-2xl mb-3 group">
                    {hasImage ? (
                        <img
                            src={card.image}
                            alt={card.title || 'Homepage highlight'}
                            className={`w-full ${style.imageHeight} object-cover transition-transform duration-300 group-hover:scale-110`}
                        />
                    ) : (
                        <div className={`w-full ${style.imageHeight} flex items-center justify-center bg-purple-100/40 text-sm text-gray-500`}>Image coming soon</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="font-bold text-gray-900 text-lg">{card.title || 'Featured Category'}</p>
                <p className={`text-sm font-semibold bg-gradient-to-r ${style.subtitleGradient} bg-clip-text text-transparent`}>
                    {card.subtitle || 'Update this card in admin panel'}
                </p>
            </motion.div>
        );
    };

    const firstColumnCards = featureCards.slice(0, 2);
    const secondColumnCards = featureCards.slice(2, 4);
    
    return (
        <section className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[650px] bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
            </div>
            
            {/* Background Image with Overlay */}
            {config.backgroundImage && (
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/85 to-white/70 z-10" />
                    <img
                        src={config.backgroundImage}
                        alt="Fresh groceries"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
            )}

            <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-28">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Promotion Badge */}
                            <div className="inline-block mb-3 sm:mb-4 lg:mb-6 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-full border-2 border-white shadow-lg">
                                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent text-xs sm:text-sm font-bold">
                                    {config.badge}
                                </span>
                            </div>

                            {/* Main Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-3 sm:mb-4 lg:mb-6 leading-tight">
                                {config.title}<br />
                                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient">
                                    {config.highlightText}
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="text-sm sm:text-base lg:text-xl text-gray-700 mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-medium">
                                {config.description}
                            </p>
                            
                            {/* CTA Button */}
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <Link to={createPageUrl('Products')}>
                                    <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-7 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-bold">
                                        {t('shopNow')} →
                                    </Button>
                                </Link>
                            </div>

                            {/* Features */}
                            <div className="mt-6 sm:mt-10 lg:mt-14 grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                                {features.map((feature, index) => (
                                    <motion.div 
                                        key={index}
                                        className="text-center p-2 sm:p-3 lg:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                        whileHover={{ y: -5 }}
                                    >
                                        <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-600" />
                                        <div className="text-base sm:text-lg lg:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            {feature.text}
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-700 mt-1 sm:mt-2 font-semibold leading-tight">
                                            {feature.subtext}
                                        </div>
                                    </motion.div>
                                ))}
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
                                {firstColumnCards.map((card, index) => renderFeatureCard(card, index))}
                            </div>
                            <div className="space-y-4 pt-8">
                                {secondColumnCards.map((card, index) => renderFeatureCard(card, index + firstColumnCards.length))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
