import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ramesh Sharma",
      location: "Ghorahi",
      rating: 5,
      text: "Best grocery delivery in Dang! Fresh products and quick delivery. Highly recommend!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh"
    },
    {
      name: "Sita Thapa",
      location: "Tulsipur",
      rating: 5,
      text: "Very convenient service. The quality of vegetables is excellent and prices are reasonable.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sita"
    },
    {
      name: "Krishna Paudel",
      location: "Lamahi",
      rating: 5,
      text: "COD option is great! Delivery is always on time. Best local mart service in Dang.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Krishna"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
          <p className="text-lg text-gray-600">Real experiences from real people</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all relative"
            >
              <Quote className="absolute top-4 right-4 w-10 h-10 text-purple-100" />
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full border-4 border-purple-100"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
