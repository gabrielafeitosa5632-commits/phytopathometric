/**
 * PhytoPathometric — Language Switcher
 * Toggle between English and Português
 */
import { useI18n, Lang } from '@/contexts/I18nContext';
import { motion } from 'framer-motion';

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-xl p-0.5 border border-border">
      {LANGS.map(l => {
        const isActive = lang === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className="relative flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all"
            style={{ color: isActive ? 'oklch(0.32 0.09 155)' : 'oklch(0.52 0.04 155)' }}
          >
            {isActive && (
              <motion.div
                layoutId="langActive"
                className="absolute inset-0 rounded-lg bg-card shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{l.flag}</span>
            <span className="relative z-10">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
