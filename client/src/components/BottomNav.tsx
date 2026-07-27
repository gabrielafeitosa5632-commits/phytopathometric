/**
 * PhytoPathometric — Premium BottomNav
 * Glassmorphism mobile bottom navigation
 */
import { Camera, BarChart2, Info, Settings, Stethoscope, LayoutDashboard, Bell, Images, CalendarDays, FileText, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';

export type TabId = 'dashboard' | 'analisar' | 'historico' | 'galeria' | 'alertas' | 'calendario' | 'relatorio' | 'doencas' | 'fieldmap' | 'sobre' | 'configuracoes';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const MOBILE_TAB_DEFS = [
  { id: 'dashboard'     as TabId, key: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'analisar'      as TabId, key: 'nav.analyze',   icon: Camera },
  { id: 'historico'     as TabId, key: 'nav.history',   icon: BarChart2 },
  { id: 'doencas'       as TabId, key: 'nav.diseases',  icon: Stethoscope },
  { id: 'configuracoes' as TabId, key: 'nav.settings',  icon: Settings },
];

const ALL_TAB_DEFS = [
  { id: 'dashboard'     as TabId, key: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'analisar'      as TabId, key: 'nav.analyze',   icon: Camera },
  { id: 'historico'     as TabId, key: 'nav.history',   icon: BarChart2 },
  { id: 'galeria'       as TabId, key: 'nav.gallery',   icon: Images },
  { id: 'alertas'       as TabId, key: 'nav.alerts',    icon: Bell },
  { id: 'calendario'    as TabId, key: 'nav.calendar',  icon: CalendarDays },
  { id: 'relatorio'     as TabId, key: 'nav.report',    icon: FileText },
  { id: 'doencas'       as TabId, key: 'nav.diseases',  icon: Stethoscope },
  { id: 'fieldmap'      as TabId, key: 'nav.fieldmap',  icon: Map },
  { id: 'sobre'         as TabId, key: 'nav.about',     icon: Info },
  { id: 'configuracoes' as TabId, key: 'nav.settings',  icon: Settings },
];

export const ALL_TABS = ALL_TAB_DEFS;

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useI18n();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bottom-nav-glass"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {MOBILE_TAB_DEFS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = t(tab.key);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-250 min-w-[56px]"
              aria-label={label}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="bottomActive"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'oklch(0.35 0.12 155 / 0.12)',
                    border: '1px solid oklch(0.55 0.18 155 / 0.20)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              {/* Icon container */}
              <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200 ${
                isActive ? 'scale-110' : 'scale-100'
              }`}>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl"
                    style={{ background: 'oklch(0.55 0.20 155 / 0.15)' }} />
                )}
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className="relative z-10 transition-all duration-200"
                  style={{
                    color: isActive
                      ? 'oklch(0.35 0.14 155)'
                      : 'oklch(0.58 0.05 155)',
                  }}
                />
              </div>

              <span
                className="relative z-10 text-[9px] font-semibold tracking-tight transition-all duration-200"
                style={{
                  color: isActive
                    ? 'oklch(0.30 0.12 155)'
                    : 'oklch(0.58 0.05 155)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 right-2.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'oklch(0.55 0.22 155)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
