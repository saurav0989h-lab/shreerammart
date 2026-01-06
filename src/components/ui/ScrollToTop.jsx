import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrollProgress = (scrolled / height) * 100;

                    setProgress(scrollProgress);
                    setIsVisible(scrolled > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-40 bg-white rounded-full p-1 shadow-2xl cursor-pointer group"
                >
                    {/* Progress Circle */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={125.6} // 2 * PI * r
                                strokeDashoffset={125.6 - (125.6 * progress) / 100}
                                className="text-emerald-500 transition-all duration-100"
                            />
                        </svg>
                        <div className="absolute inset-0 bg-white m-1 rounded-full flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <ArrowUp className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
