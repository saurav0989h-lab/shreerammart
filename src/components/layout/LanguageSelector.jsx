import { useLanguage } from '@/components/ui/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', shortName: 'EN' },
    { code: 'np', name: 'नेपाली', flag: '🇳🇵', shortName: 'नेप' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', shortName: 'हिन्दी' }
  ];
  
  return (
    <div className="flex gap-2">
      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={
              isActive
                ? 'group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border-2 bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 shadow-lg'
                : 'group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border-2 bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
            }
          >
            <span className="text-lg">{lang.flag}</span>
            <span className={isActive ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-gray-300 group-hover:text-white'}>
              {lang.shortName}
            </span>
            {isActive && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
