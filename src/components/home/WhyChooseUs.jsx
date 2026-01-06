import { Truck, Shield, Clock, Wallet, MapPin, HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { motion } from 'framer-motion';

export default function WhyChooseUs() {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: MapPin,
      title: language === 'np' ? 'स्थानीय डेलिभरी' : 'Local Delivery',
      description: language === 'np' ? 'हामी दाङ उपत्यकामा डेलिभरी गर्छौं - घोराही, तुलसीपुर र वरपरका क्षेत्रहरू' : 'We deliver across Dang Valley - Ghorahi, Tulsipur, and surrounding areas',
      color: 'bg-red-100 text-red-600',
      gradient: 'from-orange-400 to-rose-400'
    },
    {
      icon: Wallet,
      title: language === 'np' ? 'क्यास अन डेलिभरी' : 'Cash on Delivery',
      description: language === 'np' ? 'अर्डर प्राप्त गर्दा भुक्तानी गर्नुहोस्। अग्रिम भुक्तानी आवश्यक छैन' : 'Pay when you receive your order. No advance payment needed',
      color: 'bg-orange-100 text-orange-600',
      gradient: 'from-amber-400 to-orange-400'
    },
    {
      icon: Clock,
      title: language === 'np' ? 'उही दिन डेलिभरी' : 'Same Day Delivery',
      description: language === 'np' ? 'दाङमा उही दिन डेलिभरीको लागि १२ बजे अघि अर्डर गर्नुहोस्' : 'Order before 12 PM for same day delivery in Dang',
      color: 'bg-blue-100 text-blue-600',
      gradient: 'from-blue-400 to-indigo-400'
    },
    {
      icon: Shield,
      title: language === 'np' ? 'गुणस्तर ग्यारेन्टी' : 'Quality Guaranteed',
      description: language === 'np' ? 'विश्वसनीय स्थानीय आपूर्तिकर्ताहरूबाट सिधै ताजा उत्पादनहरू' : 'Fresh products directly from trusted local suppliers',
      color: 'bg-purple-100 text-purple-600',
      gradient: 'from-violet-400 to-purple-400'
    },
    {
      icon: HeartHandshake,
      title: language === 'np' ? 'स्थानीय समर्थन' : 'Support Local',
      description: language === 'np' ? 'तपाईंको खरिदले दाङका स्थानीय व्यवसायहरूलाई समर्थन गर्छ' : 'Your purchase supports local businesses in Dang',
      color: 'bg-pink-100 text-pink-600',
      gradient: 'from-pink-400 to-rose-400'
    },
    {
      icon: Truck,
      title: language === 'np' ? 'व्यापार खाता' : 'Business Accounts',
      description: language === 'np' ? 'रेस्टुरेन्ट र होटलहरूको लागि १०% छुट र नि:शुल्क डेलिभरी' : '10% discount & free delivery for restaurants & hotels',
      color: 'bg-cyan-100 text-cyan-600',
      gradient: 'from-cyan-400 to-teal-400'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-xl" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4"
          >
            {t('whyChooseUs')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {language === 'np' ? 'हामी तपाईंको किनमेल अनुभव सहज बनाउन प्रतिबद्ध छौं' : "We're committed to making your shopping experience seamless"}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 preserve-3d"
            >
              <div className={`
                absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} 
                opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500
              `} />

              <div className={`
                w-16 h-16 rounded-2xl ${feature.color} 
                flex items-center justify-center mb-6 
                shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
              `}>
                <feature.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-500 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                {feature.description}
              </p>

              <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <Truck className="w-6 h-6 text-gray-200" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}