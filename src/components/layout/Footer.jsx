import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/ui/LanguageContext';
import { MapPin, Phone, Mail, Clock, ExternalLink, Store, Shield, CreditCard, Truck, Wallet, Smartphone, Globe, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  const { data: stores = [] } = useQuery({
    queryKey: ['footer-stores'],
    queryFn: () => base44.entities.ShopLocation.filter({ is_active: true }),
  });

  const nepalPaymentMethods = [
    'Cash on Delivery (COD)',
    'eSewa',
    'Fonepay',
    'Bank Transfer'
  ];

  const indiaPaymentMethods = [
    'UPI',
    'PhonePe'
  ];

  const internationalPaymentMethods = [
    'Visa',
    'Mastercard',
    'American Express',
    'PayPal'
  ];

  const getGoogleMapsUrl = (store) => {
    if (store.google_maps_url) return store.google_maps_url;
    if (store.latitude && store.longitude) {
      return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + ', Dang, Nepal')}`;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Top Section with Features */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center gap-4 p-5 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-2xl backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Truck className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1 text-sm sm:text-base">Free Delivery</h4>
                <p className="text-xs sm:text-sm text-gray-300">On orders over Rs. 1500</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 sm:p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-2xl backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <CreditCard className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1 text-sm sm:text-base">Multiple Payment</h4>
                <p className="text-xs sm:text-sm text-gray-300">COD, Digital & Cards</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 sm:p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1 text-sm sm:text-base">100% Secure</h4>
                <p className="text-xs sm:text-sm text-gray-300">Safe & verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-2xl">SR</span>
              </div>
              <div>
                <h3 className="font-black text-xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">ShreeramMart</h3>
                <p className="text-xs text-gray-400 font-medium">Local Delivery Service</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-300 mb-4">
              Your trusted local marketplace for groceries, dairy, bakery items,
              and furniture. Supporting local businesses in Dang Valley.
            </p>
            
            {/* Payment Methods Box */}
            <div className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-white text-base">Payment We Accept</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">
                    <Wallet className="w-4 h-4" />
                    <span>Nepal</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nepalPaymentMethods.map(method => (
                      <span key={method} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-xs text-gray-200 border border-emerald-500/30 hover:border-emerald-400/50 transition-colors">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-2">
                    <Smartphone className="w-4 h-4" />
                    <span>India</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {indiaPaymentMethods.map(method => (
                      <span key={method} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-xs text-gray-200 border border-indigo-500/30 hover:border-indigo-400/50 transition-colors">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wide mb-2">
                    <Globe className="w-4 h-4" />
                    <span>International</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {internationalPaymentMethods.map(method => (
                      <span key={method} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-xs text-gray-200 border border-blue-500/30 hover:border-blue-400/50 transition-colors">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">{t('quickLinks')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={createPageUrl('Products')} className="hover:text-purple-400 transition-colors flex items-center gap-2"><span>→</span>{t('allProducts')}</Link></li>
              <li><Link to={`${createPageUrl('Products')}?category=grocery`} className="hover:text-purple-400 transition-colors flex items-center gap-2"><span>→</span>Grocery</Link></li>
              <li><Link to={`${createPageUrl('Products')}?category=dairy-sweets`} className="hover:text-purple-400 transition-colors flex items-center gap-2"><span>→</span>Dairy & Sweets</Link></li>
              <li><Link to={`${createPageUrl('Products')}?category=bakery`} className="hover:text-purple-400 transition-colors flex items-center gap-2"><span>→</span>Bakery</Link></li>
              <li><Link to={createPageUrl('About')} className="hover:text-purple-400 transition-colors flex items-center gap-2"><span>→</span>About Us</Link></li>
              <li><Link to={createPageUrl('Contact')} className="hover:text-purple-400 transition-colors flex items-center gap-2"><span>→</span>Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">{t('contactUs')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">Shree Ram kirana Pasal<br />Tulsipur 5 galine Dang</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a href="tel:+9779844988588" className="text-gray-300 hover:text-purple-400 transition-colors">+977-9844988588</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a href="mailto:saurav0945m@gmail.com" className="text-gray-300 hover:text-purple-400 transition-colors">saurav0945m@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">6:00 AM - 10:00 PM</span>
              </li>
            </ul>
            
            {/* Social Media Icons */}
            <div className="mt-6 flex items-center gap-3">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.08 1.61 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a5.97 5.97 0 0 0-1-.08A6.59 6.59 0 0 0 5 16.35a6.59 6.59 0 0 0 6.59 6.59 6.52 6.52 0 0 0 6.59-6.59V8.41a8.21 8.21 0 0 0 3.41 1.41v-3.13z"/></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all">
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('delivery')}</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ {t('codAvailable')}</li>
              <li>✓ {t('sameDayDelivery')}</li>
              <li>✓ {t('freeDeliveryOver')} {t('rs')}1500</li>
            </ul>
          </div>
        </div>

        {/* Store Locations */}
        {stores.length > 0 && (
          <div className="border-t border-gray-800 mt-10 pt-8">
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" /> {t('ourStoreLocations')}
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {stores.map(store => (
                <div key={store.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors">
                  <h5 className="font-medium text-white text-sm mb-2">{store.name}</h5>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                      {store.address}
                    </p>
                    {store.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {store.phone}
                      </p>
                    )}
                    {store.opening_hours && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {store.opening_hours}
                      </p>
                    )}
                  </div>
                  <a
                    href={getGoogleMapsUrl(store)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> {t('getDirections')}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 ShreeramMart. {t('allRightsReserved')}</p>
          <p className="text-gray-500">{t('madeWithLove')}</p>
        </div>
      </div>
    </footer>
  );
}