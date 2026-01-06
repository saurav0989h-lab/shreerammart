import { useEffect, useRef } from 'react';

/**
 * Framer Motion animation variants for consistent transitions
 */

// Fade in from bottom
export const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Fade in from left
export const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Fade in from right
export const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Scale in
export const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Stagger children
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Hover lift effect
export const hoverLift = {
    rest: { y: 0, scale: 1 },
    hover: {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

// 3D tilt effect
export const tilt3D = {
    rest: { rotateX: 0, rotateY: 0, scale: 1 },
    hover: {
        rotateX: 5,
        rotateY: -5,
        scale: 1.05,
        transition: { duration: 0.3 }
    }
};

// Slide up drawer
export const slideUpDrawer = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }
    },
    exit: {
        y: '100%',
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

// Modal backdrop
export const modalBackdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

// Bounce in
export const bounceIn = {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
        opacity: 1,
        scale: [0.3, 1.05, 0.9, 1],
        transition: { duration: 0.6 }
    }
};

/**
 * Custom hook for parallax scroll effect
 */
export function useParallax(speed = 0.5) {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrolled;
            const distance = scrolled - elementTop;

            element.style.transform = `translateY(${distance * speed}px)`;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return ref;
}

/**
 * Custom hook for scroll-triggered animations
 */
export function useScrollAnimation(threshold = 0.1) {
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    element.classList.add('animate-fade-in-up');
                    hasAnimated.current = true;
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}

/**
 * Custom hook for 3D tilt effect on mouse move
 */
export function useTilt(maxTilt = 10) {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * maxTilt;
            const rotateY = ((centerX - x) / centerX) * maxTilt;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        };

        const handleMouseLeave = () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [maxTilt]);

    return ref;
}
