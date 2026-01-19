import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Users, Truck, Heart, ShoppingBag, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Bringing Local Businesses of Dang Together
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We are a local marketplace connecting you with the best grocery, dairy, bakery, 
            and furniture shops in Dang Valley.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl('Products')}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Shop Now
              </Button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Dang Bazaar started with a simple idea: to make it easier for people in Dang 
                  to access fresh groceries, dairy products, bakery items, and furniture 
                  without having to visit multiple shops.
                </p>
                <p>
                  We partner with trusted local businesses across Ghorahi, Tulsipur, and 
                  other areas of Dang to bring you quality products at fair prices.
                </p>
                <p>
                  Whether you're looking for daily essentials, planning a party, or 
                  organizing a wedding, we're here to help with convenient home delivery 
                  and cash on delivery options.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400" 
                alt="Local market"
                className="rounded-2xl object-cover h-48 w-full"
              />
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400" 
                alt="Fresh produce"
                className="rounded-2xl object-cover h-48 w-full mt-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" 
                alt="Bakery"
                className="rounded-2xl object-cover h-48 w-full"
              />
              <img 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" 
                alt="Furniture"
                className="rounded-2xl object-cover h-48 w-full mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Wide Product Range',
                description: 'From fresh grocery and dairy to bakery items and furniture - all in one place'
              },
              {
                icon: Truck,
                title: 'Home Delivery',
                description: 'Fast and reliable delivery across Dang Valley with same-day options available'
              },
              {
                icon: Clock,
                title: 'Flexible Timing',
                description: 'Choose morning, afternoon, or evening delivery slots that suit your schedule'
              },
              {
                icon: Heart,
                title: 'Support Local',
                description: 'Every purchase supports local businesses and families in Dang'
              },
              {
                icon: Users,
                title: 'Bulk Orders',
                description: 'Special pricing and service for restaurants, hotels, and events'
              },
              {
                icon: MapPin,
                title: 'Local Knowledge',
                description: 'We understand the needs of Dang residents and source products accordingly'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Service Area</h2>
          <p className="text-xl text-gray-600 mb-8">
            We deliver across all major areas in Dang District
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Ghorahi', 'Tulsipur', 'Lamahi', 'Rapti', 'Dangisharan',
              'Shantinagar', 'Rajpur', 'Gadhawa', 'Banglachuli', 'Babai'
            ].map(area => (
              <span 
                key={area}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Have Questions?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            We're here to help. Reach out to us anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+977-9844988588</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>saurav0945m@gmail.com</span>
            </div>
          </div>
          <Link to={createPageUrl('Contact')}>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}