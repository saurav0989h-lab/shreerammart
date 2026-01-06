import { Shield, Truck, Clock, CreditCard, Award, RefreshCw, Lock, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "100% Secure",
      subtitle: "Safe Shopping",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Truck,
      title: "Free Delivery",
      subtitle: "Above Rs. 500",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Clock,
      title: "Same Day",
      subtitle: "Fast Delivery",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: CreditCard,
      title: "COD Available",
      subtitle: "Easy Payment",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Award,
      title: "Quality Products",
      subtitle: "Fresh & Verified",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      subtitle: "Hassle Free",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      subtitle: "Data Secure",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: HeartHandshake,
      title: "24/7 Support",
      subtitle: "Always Here",
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Shop With Us?</h2>
          <p className="text-gray-600">Your trusted local mart in Dang</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-gray-50 transition-all group"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <badge.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{badge.title}</h3>
              <p className="text-sm text-gray-600">{badge.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
