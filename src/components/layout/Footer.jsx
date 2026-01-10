import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/ui/LanguageContext';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, ExternalLink, Store, Shield, CreditCard, Truck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  const { data: stores = [] } = useQuery({
    queryKey: ['footer-stores'],
    queryFn: () => base44.entities.ShopLocation.filter({ is_active: true }),
  });

  const getGoogleMapsUrl = (store) => {
    if (store.google_maps_url) return store.google_maps_url;
    if (store.latitude && store.longitude) {
      return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + ', Dang, Nepal')}`;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Top Section with Features */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Free Delivery</h4>
                <p className="text-xs text-gray-400">On orders above Rs. 500</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">COD Available</h4>
                <p className="text-xs text-gray-400">Pay on delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">100% Secure</h4>
                <p className="text-xs text-gray-400">Safe shopping guaranteed</p>
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
                <span className="text-white font-black text-2xl">D</span>
              </div>
              <div>
                <h3 className="font-black text-xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Dang Bazaar</h3>
                <p className="text-xs text-gray-400 font-medium">Local Delivery Service</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-300 mb-4">
              Your trusted local marketplace for groceries, dairy, bakery items,
              and furniture. Supporting local businesses in Dang Valley.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 flex items-center justify-center transition-all hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-all hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
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
                <span className="text-gray-300">7:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('delivery')}</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ {t('codAvailable')}</li>
              <li>✓ {t('sameDayDelivery')}</li>
              <li>✓ {t('freeDeliveryOver')} {t('rs')}1500</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
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
          <p>© 2025 Dang Bazaar. {t('allRightsReserved')}</p>
          <p className="text-gray-500">{t('madeWithLove')}</p>
        </div>
      </div>
    </footer>
  )
}