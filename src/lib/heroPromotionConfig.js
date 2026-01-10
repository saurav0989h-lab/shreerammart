export const BASE_FEATURE_CARDS = [
  {
    id: 'card-1',
    title: 'Fresh Vegetables',
    subtitle: 'Daily Fresh Stock ✨',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'card-2',
    title: 'Fresh Bakery',
    subtitle: 'Daily Baked 🥐',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'card-3',
    title: 'Dairy Products',
    subtitle: 'Fresh & Pure 🥛',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'card-4',
    title: 'Fresh Fruits',
    subtitle: 'Farm Fresh 🍎',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
  },
];

export const BASE_HERO_PROMOTION_CONFIG = {
  badge: '🎉 New Year Sale 2026',
  title: 'Get Fresh Groceries',
  highlightText: 'Delivered to Your Door',
  description: 'Shop from the best local stores in Dang. Fresh products, great prices, fast delivery!',
  feature1Text: 'FREE Delivery',
  feature1Subtext: 'On orders over Rs. 500',
  feature2Text: 'SAME DAY',
  feature2Subtext: 'Fast Delivery',
  feature3Text: 'COD',
  feature3Subtext: 'Payment Available',
  backgroundImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
  showPopup: true,
  firstSlideDuration: 10, // seconds
  normalSlideDuration: 6, // seconds
  featureCards: BASE_FEATURE_CARDS,
};

export function getDefaultFeatureCards() {
  return BASE_FEATURE_CARDS.map((card) => ({ ...card }));
}

export function getDefaultHeroPromotionConfig() {
  return {
    ...BASE_HERO_PROMOTION_CONFIG,
    featureCards: getDefaultFeatureCards(),
  };
}

export function parseHeroPromotionSetting(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse hero promotion setting', error);
    return null;
  }
}

export function mergeHeroPromotionConfig(storedConfig) {
  const defaults = getDefaultHeroPromotionConfig();
  if (!storedConfig || typeof storedConfig !== 'object') {
    return defaults;
  }

  const mergedFeatureCards = defaults.featureCards.map((card, index) => ({
    ...card,
    ...(storedConfig.featureCards?.[index] || {}),
  }));

  return {
    ...defaults,
    ...storedConfig,
    featureCards: mergedFeatureCards,
    showPopup: storedConfig.showPopup ?? defaults.showPopup,
    firstSlideDuration: storedConfig.firstSlideDuration ?? defaults.firstSlideDuration,
    normalSlideDuration: storedConfig.normalSlideDuration ?? defaults.normalSlideDuration,
  };
}

export function getHeroPromotionSignature(config) {
  if (!config) return '';
  const merged = mergeHeroPromotionConfig(config);
  return JSON.stringify({
    badge: merged.badge,
    title: merged.title,
    highlightText: merged.highlightText,
    description: merged.description,
    backgroundImage: merged.backgroundImage,
    showPopup: merged.showPopup,
    firstSlideDuration: merged.firstSlideDuration,
    normalSlideDuration: merged.normalSlideDuration,
    featureCards: merged.featureCards.map((card) => ({
      title: card?.title,
      subtitle: card?.subtitle,
      image: card?.image,
    })),
  });
}
