import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { mergeHeroPromotionConfig, parseHeroPromotionSetting } from '@/lib/heroPromotionConfig';

export function useHeroPromotionConfig() {
  const query = useQuery({
    queryKey: ['hero-promotion'],
    queryFn: async () => {
      const result = await base44.entities.SiteSettings.filter({ setting_key: 'hero_promotion' });
      if (result && result.length > 0 && result[0]?.setting_value) {
        return parseHeroPromotionSetting(result[0].setting_value);
      }
      return null;
    },
  });

  const config = useMemo(() => mergeHeroPromotionConfig(query.data), [query.data]);

  return {
    ...query,
    config,
    rawConfig: query.data,
  };
}
