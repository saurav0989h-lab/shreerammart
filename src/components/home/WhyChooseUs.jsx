import { Truck, Shield, Clock, Wallet, HeartHandshake, Gift, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { motion } from 'framer-motion';

export default function WhyChooseUs() {
  const { language } = useLanguage();

  const reasons = [
    {
      icon: Truck,
      title: language === 'np' ? 'रु. १५०० माथि निःशुल्क डेलिभरी' : 'Free Delivery Above Rs. 1500',
      description: language === 'np'
        ? 'सबै क्षेत्रमा छिटो डेलिभरी, न्यूनतम कुना शुल्क'
        : 'Fast coverage across Dang with no delivery fee above Rs. 1500.'
    },
    {
      icon: Clock,
      title: language === 'np' ? 'उही दिन सेवाहरू' : 'Same-Day Convenience',
      description: language === 'np'
        ? 'दिउँसो १२ बजे अघि अर्डर गर्दा उही दिन डेलिभरी'
        : 'Order before noon and receive your essentials the same day.'
    },
    {
      icon: Shield,
      title: language === 'np' ? '१००% गुणस्तर' : 'Guaranteed Quality',
      description: language === 'np'
        ? 'निश्चिन्त किनमेलका लागि प्रत्येक वस्तु जाँचिएको र सुरक्षित'
        : 'Every item is hand-checked for freshness and safety.'
    },
    {
      icon: Wallet,
      title: language === 'np' ? 'रेस्टुरेन्ट र इभेन्टमा १०% छुट' : '10% Off for Restaurants & Events',
      description: language === 'np'
        ? 'हामीसँग ठूला अर्डरहरूका लागि विशेष दर र फ्री डेलिभरी'
        : 'Special pricing plus free delivery for restaurant, café, and event orders.'
    },
    {
      icon: ShoppingBag,
      title: language === 'np' ? 'व्यक्तिगत किनमेल सहयोग' : 'Personal Shopper Support',
      description: language === 'np'
        ? 'किनमेल सूची पठाउनुहोस्, हामीले मिलाएर तयारी गर्छौं'
        : 'Send your shopping list and we handpick everything for you.'
    },
    {
      icon: Gift,
      title: language === 'np' ? 'गिफ्ट र कस्टम ह्याम्पर' : 'Gifting & Custom Hampers',
      description: language === 'np'
        ? 'कार्यक्रम र विशेष अवसरका लागि व्यक्तिगत गिफ्ट समाधान'
        : 'Curated gifts and hampers tailored to your occasion.'
    },
    {
      icon: HeartHandshake,
      title: language === 'np' ? 'स्थानीय व्यवसायलाई समर्थन' : 'Support Local Businesses',
      description: language === 'np'
        ? 'तपाईंको प्रत्येक किनमेलले दाङका स्थानीय आपूर्तिकर्तालाई सहयोग गर्छ'
        : 'Every order helps small vendors and farmers in Dang.'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white via-purple-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-gray-900"
          >
            {language === 'np' ? 'श्रीराममार्ट किन रोज्ने?' : 'Why Choose ShreeramMart'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            {language === 'np'
              ? 'छिटो डेलिभरी, स्थानीय मूल्य र व्यक्तिगत सहयोग सहितको सम्पूर्ण किनमेल समाधान'
              : 'The complete local shopping partner with fast delivery, fair pricing, and personal support.'}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center">
                <reason.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{reason.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}