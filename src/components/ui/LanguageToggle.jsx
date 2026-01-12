import { useLanguage } from './LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ variant = 'default' }) {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguage = language === 'en' ? 'np' : (language === 'np' ? 'hi' : 'en');
  const nextLanguageLabel = { en: 'English', np: 'नेपाली', hi: 'हिन्दी' }[nextLanguage];

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 text-sm font-medium hover:text-emerald-400 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {nextLanguageLabel}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="w-4 h-4" />
      {nextLanguageLabel}
    </Button>
  );
}