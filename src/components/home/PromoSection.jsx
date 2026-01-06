import { Link } from 'react-router-dom';
import { Clock, Percent, TrendingUp, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromoSection() {
  const promos = [
    {
      icon: Clock,
      title: "Flash Sale",
      subtitle: "Up to 40% OFF",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
      link: "/Products?sale=true"
    },
    {
      icon: Percent,
      title: "Daily Deals",
      subtitle: "Fresh Products",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      link: "/Products"
    },
    {
      icon: TrendingUp,
      title: "Best Sellers",
      subtitle: "Top Rated Items",
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      link: "/Products?sort=popular"
    },
    {
      icon: Gift,
      title: "Gift Cards",
      subtitle: "Perfect Gifting",
      color: "from-pink-500 to-purple-600",
      bgColor: "from-pink-50 to-purple-50",
      link: "/Products"
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {promos.map((promo, index) => (
            <Link key={index} to={promo.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.bgColor} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${promo.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${promo.color} text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <promo.icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{promo.title}</h3>
                  <p className={`text-sm font-semibold bg-gradient-to-r ${promo.color} bg-clip-text text-transparent`}>
                    {promo.subtitle}
                  </p>
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-2xl">→</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
