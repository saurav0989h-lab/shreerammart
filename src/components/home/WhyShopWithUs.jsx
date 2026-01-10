import { ShoppingCart, Truck, Shield, Clock, Wallet, MapPin, HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function WhyShopWithUs() {
  const { language } = useLanguage();

  const reasons = [
    {
      icon: ShoppingCart,
      title: language === 'np' ? 'एकै स्थानमा सबैकुरा' : 'Everything in One Place',
      description:
        language === 'np'
          ? 'ग्रोसरी, डेरी, बेकारी, फर्निचर र गिफ्ट - सबै एकै ठाउँमा'
          : 'Groceries, dairy, bakery, furniture, and gifts under one roof',
    },
    {
      icon: MapPin,
      title: language === 'np' ? 'स्थानीय बजार' : 'Local Marketplace',
      description:
        language === 'np'
          ? 'दाङका स्थानीय पसलहरू र उत्पादनहरूलाई समर्थन गर्नुहोस्'
          : 'Support local stores and producers across Dang',
    },
    {
      icon: Truck,
      title: language === 'np' ? 'छिटो डेलिभरी' : 'Fast Delivery',
      description:
        language === 'np'
          ? 'समान दिन वा अर्को दिन डेलिभरी सेवा'
          : 'Same-day or next-day delivery coverage',
    },
    {
      icon: Clock,
      title: language === 'np' ? 'समय भन्दा अगाडि' : 'Always On Time',
      description:
        language === 'np'
          ? 'निर्धारित समयमै डेलिभरी, कुनै ढिलाइ बिना'
          : 'Reliable scheduling to match your day',
    },
    {
      icon: Wallet,
      title: language === 'np' ? 'सस्तो मूल्य' : 'Best Value',
      description:
        language === 'np'
          ? 'न्यूनतम डेलिभरी शुल्क, विशेष कूपन र प्रस्ताव'
          : 'Low delivery fees plus exclusive offers and coupons',
    },
    {
      icon: Shield,
      title: language === 'np' ? 'विश्वासिलो सेवा' : 'Trusted Service',
      description:
        language === 'np'
          ? 'गुणस्तर सुनिश्चितता र सुरक्षित डेलिभरी'
          : 'Quality assurance with careful handling',
    },
    {
      icon: HeartHandshake,
      title: language === 'np' ? 'मैत्रीपूर्ण सहयोग' : 'Friendly Support',
      description:
        language === 'np'
          ? 'समर्पित टीम हरेक चरणमा तपाईंको साथमा'
          : 'Dedicated team to help at every step',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            {language === 'np' ? 'किन हामीबाट किन्ने?' : 'Why Shop With Us'}
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'np'
              ? 'तपाईंको दैनिक आवश्यकता, उपहार र विशेष अर्डरहरूका लागि एकीकृत समाधान'
              : 'Your one-stop solution for daily essentials, gifting, and special orders'}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center mb-4">
                <reason.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{reason.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
