/**
 * PhytoPathometric — Premium Language Switcher
 * Glassmorphism pill toggle
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
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-xl"
      style={{
        background: 'oklch(0.88 0.018 138 / 0.5)',
        border: '1px solid oklch(0.85 0.02 138 / 0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {LANGS.map(l => {
        const isActive = lang === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className="relative flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all duration-150"
            style={{
              color: isActive
                ? 'oklch(0.25 0.10 155)'
                : 'oklch(0.52 0.05 155)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="langActive"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'oklch(1 0 0 / 0.90)',
                  boxShadow: '0 1px 4px oklch(0 0 0 / 0.10)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-sm leading-none">{l.flag}</span>
            <span className="relative z-10 leading-none">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
