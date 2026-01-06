import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroPromotionConfig } from '@/hooks/useHeroPromotionConfig';
import { getHeroPromotionSignature } from '@/lib/heroPromotionConfig';
import { createPageUrl } from '@/utils';

export default function PromotionPopup() {
  const { config, isLoading } = useHeroPromotionConfig();
  const [visible, setVisible] = useState(false);
  const [signature, setSignature] = useState('');

  const popupContent = useMemo(() => {
    if (!config) return null;
    return {
      badge: config.badge,
      title: config.title,
      highlightText: config.highlightText,
      description: config.description,
      showPopup: config.showPopup !== false,
    };
  }, [config]);

  useEffect(() => {
    if (isLoading) return;
    if (!popupContent || !popupContent.showPopup) {
      setVisible(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const currentSignature = getHeroPromotionSignature(config);
    setSignature(currentSignature);
    const storedSignature = window.localStorage.getItem('hero-promotion-dismissed');

    if (storedSignature !== currentSignature) {
      setVisible(true);
    }
  }, [config, popupContent, isLoading]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined' && signature) {
      window.localStorage.setItem('hero-promotion-dismissed', signature);
    }
    setVisible(false);
  };

  if (!visible || !popupContent) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full px-3 sm:px-0">
      <div className="relative rounded-2xl border border-purple-200 bg-white shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 shadow flex items-center justify-center"
          aria-label="Dismiss promotion"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                {popupContent.badge}
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                {popupContent.title}{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  {popupContent.highlightText}
                </span>
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {popupContent.description}
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700"
              onClick={handleDismiss}
            >
              Got it
            </Button>
            <Link to={createPageUrl('Products')} className="flex-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full border-purple-200 hover:bg-purple-50"
              >
                Shop Now
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Don’t show again
          </button>
        </div>
      </div>
    </div>
  );
}
