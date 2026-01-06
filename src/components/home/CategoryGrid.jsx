import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/ui/LanguageContext';
import { ShoppingBasket, Milk, Croissant, Sofa, Package, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import CategoryCard3D from './CategoryCard3D';

const categoryIcons = {
  grocery: ShoppingBasket,
  'dairy-sweets': Milk,
  bakery: Croissant,
  furniture: Sofa,
  'dairy-products': Package,
};

const categoryColors = {
  grocery: { bg: 'bg-gradient-to-br from-green-50 to-emerald-100', icon: 'text-emerald-600' },
  'dairy-sweets': { bg: 'bg-gradient-to-br from-pink-50 to-purple-100', icon: 'text-pink-600' },
  bakery: { bg: 'bg-gradient-to-br from-orange-50 to-amber-100', icon: 'text-orange-600' },
  furniture: { bg: 'bg-gradient-to-br from-purple-50 to-indigo-100', icon: 'text-purple-600' },
  'dairy-products': { bg: 'bg-gradient-to-br from-blue-50 to-cyan-100', icon: 'text-cyan-600' },
  default: { bg: 'bg-gradient-to-br from-gray-50 to-slate-100', icon: 'text-gray-600' }
};

const defaultCategories = [
  { id: 'grocery', name: 'Grocery', slug: 'grocery', description: 'Fresh vegetables, fruits, rice & essentials' },
  { id: 'dairy-sweets', name: 'Dairy & Sweets', slug: 'dairy-sweets', description: 'Breakfast items, sweets & snacks' },
  { id: 'bakery', name: 'Bakery', slug: 'bakery', description: 'Fresh bread, cakes & pastries' },
  { id: 'furniture', name: 'Furniture', slug: 'furniture', description: 'Home & office furniture' },
  { id: 'dairy-products', name: 'Dairy Products', slug: 'dairy-products', description: 'Milk, paneer, ghee & curd' },
];

export default function CategoryGrid({ categories = [] }) {
  const { t, language } = useLanguage();
  const displayCategories = categories.length > 0 ? categories.slice(0, 5) : defaultCategories;

  return (
    <section className="py-20 relative overflow-hidden bg-gray-50/50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[10%] right-[-5%] w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block p-2 px-4 rounded-full bg-white border border-gray-100 shadow-sm mb-4"
          >
            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Explore Collections
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl lg:text-5xl font-black mb-6 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-gradient-premium bg-clip-text text-transparent">
              {t('browseCategories')}
            </span>
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Find exactly what you need from our wide range of premium products ✨
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {displayCategories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Package;
            const colors = categoryColors[category.slug] || categoryColors.default;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                className="h-full"
              >
                <CategoryCard3D
                  category={{
                    ...category,
                    name: language === 'np' && category.name_np ? category.name_np : category.name
                  }}
                  icon={Icon}
                  colors={colors}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}