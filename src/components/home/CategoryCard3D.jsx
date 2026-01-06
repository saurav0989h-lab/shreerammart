import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useTilt } from '@/utils/animations';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryCard3D({ category, icon: Icon, colors }) {
    const cardRef = useTilt(10);

    return (
        <Link to={`${createPageUrl('Products')}?category=${category.slug}`}>
            <div
                ref={cardRef}
                className="relative group h-full preserve-3d"
            >
                <div className={`
          relative h-full p-6 rounded-3xl overflow-hidden
          bg-white border border-gray-100
          shadow-lg hover:shadow-2xl transition-all duration-300
          transform-style-3d
        `}>
                    {/* Gradient Background Effect */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colors.bg.replace('bg-', 'bg-')}`} />

                    {/* Dynamic Background Blob */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-20 transition-transform duration-500 group-hover:scale-150 ${colors.bg.replace('bg-gradient-to-br', 'bg')}`} />

                    <div className="relative z-10 flex flex-col h-full items-center text-center transform-style-3d group-hover:translate-z-10">
                        {/* Icon Container */}
                        <div className={`
              w-16 h-16 mb-4 rounded-2xl flex items-center justify-center
              ${colors.bg} ${colors.icon}
              shadow-inner border border-white/50
              transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
            `}>
                            <Icon className="w-8 h-8 drop-shadow-sm" />
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-colors">
                            {category.name}
                        </h3>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 group-hover:text-gray-700 transition-colors">
                            {category.description}
                        </p>

                        {/* Action Icon */}
                        <div className="mt-auto opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${colors.icon}`}>
                                Explore <ArrowUpRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
