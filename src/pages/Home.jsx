import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';
import PromotionBanners from '@/components/home/PromotionBanners';
import PromotionPopup from '@/components/home/PromotionPopup';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import ListUploadForm from '@/components/checkout/ListUploadForm';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_visible: true }, 'display_order'),
  });

  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ is_featured: true, is_visible: true }, '-created_date', 8),
  });



  return (
    <div className="bg-gray-50">
      <HeroSlider />

      {/* List Upload Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Have Your Own Shopping List?
            </h2>
            <p className="text-lg text-gray-600">Upload your list or photos, and we'll prepare your order</p>
          </div>
          <ListUploadForm />
        </div>
      </section>

      <PromotionPopup />
      <PromotionBanners />
      <PromoSection />
      <CategoryGrid categories={categories} />
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <FeaturedProducts products={featuredProducts} />
      )}

      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}